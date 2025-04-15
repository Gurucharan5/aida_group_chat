import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  doc,
  setDoc,
  getDoc,
  getDocs,
  limit,
  startAfter,
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { sendPushNotification } from "@/helpers/SendNotification";

interface Message {
  id: string;
  text: string;
  sender: string;
  createdAt: Timestamp;
}

export default function ChatRoom() {
  const {
    id: groupId,
    name: groupName,
    createdBy,
  } = useLocalSearchParams<{
    id: string;
    name: string;
    createdBy: string;
  }>();
  const currentUserId = auth.currentUser?.uid;
  const isAdmin = currentUserId === createdBy;
  const [messages, setMessages] = useState<Message[]>([]);
  const PAGE_SIZE = 20;
  const [newMessage, setNewMessage] = useState("");
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  useEffect(() => {
    const q = query(
      collection(db, "groups", groupId, "messages"),
      orderBy("createdAt", "desc"),
      limit(PAGE_SIZE)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Message, "id">),
      }));
      setMessages(msgs.reverse());

      // Auto-scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return unsubscribe;
  }, [groupId]);

  const [isAppAdmin, setIsAppAdmin] = useState(false);
  useEffect(() => {
    const fetchAdminStatus = async () => {
      const isAdmin = await checkIfUserIsAdmin();
      // console.log("Is Admin:", isAdmin);
      setIsAppAdmin(isAdmin);
      // Do something with the result (e.g., set state)
    };

    fetchAdminStatus();
  }, []);

  const checkIfUserIsAdmin = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return false;

    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        return data.isAdmin === true;
      } else {
        // console.log("User document not found");
        return false;
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  };
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const senderId = auth.currentUser?.uid;
    const senderName = auth.currentUser?.displayName || "Guest";
    await addDoc(collection(db, "groups", groupId, "messages"), {
      text: newMessage.trim(),
      sender: auth.currentUser?.displayName || "Guest",
      createdAt: Timestamp.now(),
    });
    setNewMessage("");
    // Check if the group is public
    try {
      const groupDocSnap = await getDoc(doc(db, "groups", groupId));
      if (!groupDocSnap.exists()) {
        console.error("Group not found");
        return;
      }

      const groupData = groupDocSnap.data();
      const isPublic = groupData.isPublic;

      let tokens: string[] = [];

      if (isPublic) {
        // Fetch all users for public group
        const usersSnap = await getDocs(collection(db, "users"));
        tokens = usersSnap.docs
          .filter(
            (docSnap) => docSnap.id !== senderId && docSnap.data().expoPushToken
          )
          .map((docSnap) => docSnap.data().expoPushToken as string);
      } else {
        // Fetch only group members for private group
        const membersSnap = await getDocs(collection(db, `groups/${groupId}/members`));
        const memberIds = membersSnap.docs.map((doc) => doc.id);
        const memberDocs = await Promise.all(
          memberIds.map((userId) => getDoc(doc(db, "users", userId)))
        );

        tokens = memberDocs
          .filter(
            (docSnap) =>
              docSnap.exists() &&
              docSnap.id !== senderId && docSnap.data().expoPushToken
          )
          .map((docSnap) => docSnap.data()!.expoPushToken as string);
      }
      // console.log("Tokens to send notifications:", tokens);
      // console.log(groupData, "--------gtoip");
      // Send notifications
      await Promise.all(
        tokens.map((token) =>
          sendPushNotification(
            token,
            groupData.name || "Group",
            `${senderName}: ${newMessage.trim()}`
          )
        )
      );
    } catch (e) {
      console.error("Failed to send notifications:", e);
    }
  };
  const handleReport = async (message: Message) => {
    try {
      const reportRef = doc(collection(db, "reports"));
      await setDoc(reportRef, {
        messageId: message.id,
        groupId,
        messageText: message.text,
        senderName: message.sender,
        reportedBy: auth.currentUser?.displayName || "Guest",
        reportedAt: Timestamp.now(),
      });
      Alert.alert("Reported", "The message has been reported.");
    } catch (error) {
      console.error("Error reporting message:", error);
      Alert.alert("Error", "Failed to report message.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      <Text style={styles.header}>{groupName}</Text>
      {isAppAdmin && (
        <View style={{ padding: 10 }}>
          <Button
            title="Manage Group"
            onPress={() =>
              router.push({
                pathname: "/group-app-admin",
                params: { groupId },
              })
            }
          />
        </View>
      )}

      {isAdmin && (
        <View style={{ padding: 10 }}>
          <Button
            title="Manage Group"
            onPress={() =>
              router.push({
                pathname: "/group-admin",
                params: { groupId },
              })
            }
          />
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onLongPress={() =>
              Alert.alert(
                "Report Message",
                "Do you want to report this message?",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Report", onPress: () => handleReport(item) },
                ],
                { cancelable: true }
              )
            }
          >
            <View style={styles.messageBubble}>
              <Text style={styles.sender}>{item.sender}</Text>
              <Text>{item.text}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 10 }}
      />

      <View style={styles.inputRow}>
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          style={styles.input}
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
    textAlign: "center",
  },
  messageBubble: {
    backgroundColor: "#f1f1f1",
    padding: 10,
    borderRadius: 8,
    marginVertical: 4,
  },
  sender: {
    fontWeight: "bold",
    marginBottom: 2,
  },
  inputRow: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginRight: 8,
    borderRadius: 6,
  },
  requestsContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  requestItem: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
  },
});
