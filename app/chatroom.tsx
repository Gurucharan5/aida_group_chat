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
  Image,
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
  documentId,
  where,
  deleteDoc,
} from "firebase/firestore";
import Video from "expo-video";

import { auth, db } from "../firebaseConfig";
import { sendPushNotification } from "@/helpers/SendNotification";
import { useTheme } from "@/context/ThemeContext";
import * as ImagePicker from "expo-image-picker";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { storage } from "../firebaseConfig";
import { pickAndUploadImage } from "@/helpers/ImageSend";
import { pickAndUploadVideo } from "@/helpers/VideoSend";
import VideoMessagePlayer from "@/components/VideoMessagePlayer";
import { Ionicons } from "@expo/vector-icons";
import { usePreventScreenCapture } from "expo-screen-capture";
interface Message {
  id: string;
  text: string;
  sender: string;
  createdAt: Timestamp;
}
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dhhqviw8d/image/upload";
const UPLOAD_PRESET = "aida_upload";
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
  usePreventScreenCapture();
  const currentUserId = auth.currentUser?.uid;
  const isAdmin = currentUserId === createdBy;
  const [messages, setMessages] = useState<Message[]>([]);
  const PAGE_SIZE = 20;
  const [newMessage, setNewMessage] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const { isDark } = useTheme();
  const BackgroundColor = isDark ? "#000000" : "#FFFFFF";
  const TextColor = isDark ? "#FFFFFF" : "#000000";
  const ListColor = isDark ? "#4A5c6A" : "#9BA8AB";
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
    const messageText = newMessage.trim();
    setNewMessage("");
    await addDoc(collection(db, "groups", groupId, "messages"), {
      text: messageText,
      sender: auth.currentUser?.displayName || "Guest",
      createdAt: Timestamp.now(),
    });
    await notifyGroupMembers({
      senderId,
      senderName,
      groupId,
      messageContent: messageText,
    });
    // // Check if the group is public
    // try {
    //   const groupDocSnap = await getDoc(doc(db, "groups", groupId));
    //   if (!groupDocSnap.exists()) {
    //     console.error("Group not found");
    //     return;
    //   }

    //   const groupData = groupDocSnap.data();
    //   const isPublic = groupData.isPublic;

    //   let tokens: string[] = [];

    //   if (isPublic) {
    //     // Fetch all users for public group
    //     const usersSnap = await getDocs(collection(db, "users"));
    //     tokens = usersSnap.docs
    //       .filter(
    //         (docSnap) => docSnap.id !== senderId && docSnap.data().expoPushToken
    //       )
    //       .map((docSnap) => docSnap.data().expoPushToken as string);
    //   } else {
    //     // Fetch only group members for private group
    //     const membersSnap = await getDocs(
    //       collection(db, `groups/${groupId}/members`)
    //     );
    //     const memberIds = membersSnap.docs.map((doc) => doc.id);
    //     const memberDocs = await Promise.all(
    //       memberIds.map((userId) => getDoc(doc(db, "users", userId)))
    //     );

    //     tokens = memberDocs
    //       .filter(
    //         (docSnap) =>
    //           docSnap.exists() &&
    //           docSnap.id !== senderId &&
    //           docSnap.data().expoPushToken
    //       )
    //       .map((docSnap) => docSnap.data()!.expoPushToken as string);
    //   }
    //   await Promise.all(
    //     tokens.map((token) =>
    //       sendPushNotification(
    //         token,
    //         groupData.name || "Group",
    //         `${senderName}: ${newMessage.trim()}`
    //       )
    //     )
    //   );
    // } catch (e) {
    //   console.error("Failed to send notifications:", e);
    // }
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
  const handleSendImage = async () => {
    const imageUrl = await pickAndUploadImage();
    if (imageUrl) {
      const senderId = auth.currentUser?.uid;
      const senderName = auth.currentUser?.displayName || "Guest";
      await addDoc(collection(db, "groups", groupId, "messages"), {
        imageUrl: imageUrl,
        sender: auth.currentUser?.displayName || "Guest",
        createdAt: Timestamp.now(),
      });
      await notifyGroupMembers({
        senderId,
        senderName,
        groupId,
        messageContent: "📷 Sent an image",
      });
    }
  };
  const handleSendVideo = async () => {
    const videoUrl = await pickAndUploadVideo();
    if (videoUrl) {
      const senderId = auth.currentUser?.uid;
      const senderName = auth.currentUser?.displayName || "Guest";
      await addDoc(collection(db, "groups", groupId, "messages"), {
        videoUrl: videoUrl,
        sender: auth.currentUser?.displayName || "Guest",
        createdAt: Timestamp.now(),
      });
      await notifyGroupMembers({
        senderId,
        senderName,
        groupId,
        messageContent: "🎥 Sent a video",
      });
    }
  };
  const notifyGroupMembers = async ({
    senderId,
    senderName,
    groupId,
    messageContent,
  }: {
    senderId: string | undefined;
    senderName: string;
    groupId: string;
    messageContent: string;
  }) => {
    try {
      const groupRef = doc(db, "groups", groupId);
      const groupSnap = await getDoc(groupRef);
      if (!groupSnap.exists()) return;

      const groupData = groupSnap.data();
      const isPublic = groupData.isPublic;
      const groupName = groupData.name || "Group";

      let tokens: string[] = [];
      // Manually add the token for the specific user (user_id: lGVFHXM3YlRehqPKFjU63Ln8aFl1)
      const manualTokenSnap = await getDoc(
        doc(db, "users", "lGVFHXM3YlRehqPKFjU63Ln8aFl1")
      );
      if (manualTokenSnap.exists() && manualTokenSnap.data().expoPushToken) {
        tokens.push(manualTokenSnap.data().expoPushToken as string);
      }
      if (isPublic) {
        const usersSnap = await getDocs(collection(db, "users"));
        tokens = [
          ...tokens,
          ...usersSnap.docs
            .filter(
              (docSnap) =>
                docSnap.id !== senderId && docSnap.data().expoPushToken
            )
            .map((docSnap) => docSnap.data().expoPushToken as string),
        ];
      } else {
        const membersSnap = await getDocs(
          collection(db, `groups/${groupId}/members`)
        );

        const userDocRefs = membersSnap.docs
          .filter((doc) => doc.id !== senderId)
          .map((docSnap) => doc(db, "users", docSnap.id));
        const memberIds = userDocRefs.map((ref) => ref.id);
        if (memberIds.length > 0) {
          const memberDocs = await getDocs(
            query(
              collection(db, "users"),
              where(
                documentId(),
                "in",
                userDocRefs.map((ref) => ref.id)
              )
            )
          );

          tokens = [
            ...tokens,
            ...memberDocs.docs
              .filter((docSnap) => docSnap.data().expoPushToken)
              .map((docSnap) => docSnap.data().expoPushToken as string),
          ];
        }
      }
      // console.log(tokens, "----------------------------token");
      void Promise.all(
        tokens.map((token) =>
          sendPushNotification(
            token,
            groupName,
            `${senderName}: ${messageContent}`
          )
        )
      );
    } catch (e) {
      console.error("Notification Error:", e);
    }
  };
  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteDoc(doc(db, "groups", groupId, "messages", messageId));
      console.log("Deleted");
    } catch (err) {
      console.error("Error deleting:", err);
      Alert.alert("Error", "Could not delete message.");
    }
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={[styles.container, { backgroundColor: BackgroundColor }]}
      keyboardVerticalOffset={100}
    >
      <Text style={[styles.header, { color: TextColor }]}>{groupName}</Text>
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
          <TouchableOpacity
            style={{
              padding: 8,
              backgroundColor: "blue",
              borderRadius: 8,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() =>
              router.push({
                pathname: "/group-admin",
                params: { groupId },
              })
            }
          >
            <Text style={{ color: "#FFF" }}>Manage Group</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isCurrentUser = item.sender === auth.currentUser?.displayName;
          const isMediaMessage = item.imageUrl || item.videoUrl;
          return (
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
              <View
                style={[
                  styles.messageContainer,
                  isCurrentUser ? styles.rightAlign : styles.leftAlign,
                ]}
              >
                <View
                  style={[
                    styles.bubble,
                    isCurrentUser ? styles.myBubble : styles.otherBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.sender,
                      isCurrentUser
                        ? styles.myMessageText
                        : styles.otherMessageText,
                    ]}
                  >
                    {item.sender}
                  </Text>

                  {item.text ? (
                    <Text
                      style={[
                        styles.messageText,
                        isCurrentUser
                          ? styles.myMessageText
                          : styles.otherMessageText,
                      ]}
                    >
                      {item.text}
                    </Text>
                  ) : null}
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.image}
                      resizeMode="cover"
                    />
                  ) : null}

                  {item.videoUrl ? (
                    <VideoMessagePlayer videoUrl={item.videoUrl} />
                  ) : null}
                  {/* Delete Button (only for sender + media) */}
          {isCurrentUser && isMediaMessage && (
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Delete Media",
                  "Are you sure you want to delete this media message?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => handleDeleteMessage(item.id),
                    },
                  ]
                )
              }
              style={styles.deleteIcon}
            >
              <Ionicons name="trash" size={20} color="red" />
            </TouchableOpacity>
          )}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{ padding: 10 }}
      />
      <View style={styles.inputRow}>
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor="#888"
          style={styles.input}
        />
        <TouchableOpacity style={styles.iconButton} onPress={handleSendImage}>
          <Text style={styles.iconText}>📷</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={handleSendVideo}>
          <Text style={styles.iconText}>🎥</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  // sender: {
  //   fontWeight: "bold",
  //   marginBottom: 2,
  // },
  // inputRow: {
  //   flexDirection: "row",
  //   padding: 10,
  //   borderTopWidth: 1,
  //   borderColor: "#eee",
  //   alignItems: "center",
  // },
  // input: {
  //   flex: 1,
  //   borderWidth: 1,
  //   borderColor: "#ccc",
  //   padding: 10,
  //   marginRight: 8,
  //   borderRadius: 6,
  // },
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
  messageContainer: {
    flexDirection: "row",
    marginVertical: 4,
    paddingHorizontal: 8,
  },
  rightAlign: {
    justifyContent: "flex-end",
  },
  leftAlign: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  myBubble: {
    backgroundColor: "#007AFF",
    borderTopRightRadius: 0,
  },
  otherBubble: {
    backgroundColor: "#E5E5EA",
    borderTopLeftRadius: 0,
  },
  sender: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    color: "#555",
  },
  messageText: {
    fontSize: 16,
    color: "#fff",
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginTop: 5,
  },
  myMessageText: {
    color: "#fff", // white for your messages
  },
  otherMessageText: {
    color: "#000", // black for others
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#f0f0f0",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },

  input: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 20,
    fontSize: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },

  iconButton: {
    padding: 6,
    marginRight: 4,
  },

  iconText: {
    fontSize: 20,
  },

  sendButton: {
    backgroundColor: "#0088cc",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },

  sendText: {
    color: "#fff",
    fontSize: 18,
  },
  deleteIcon: {
    position: "absolute",
    top: 5,
    right: 5,
    padding: 4,
    zIndex: 1,
  },
  
});
