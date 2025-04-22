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
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
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

import { auth, db } from "../firebaseConfig";
import { sendPushNotification } from "@/helpers/SendNotification";
import { useTheme } from "@/context/ThemeContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { pickAndUploadImage } from "@/helpers/ImageSend";
import { pickAndUploadVideo } from "@/helpers/VideoSend";
import VideoMessagePlayer from "@/components/VideoMessagePlayer";
// import { Ionicons } from "@expo/vector-icons";
import { usePreventScreenCapture } from "expo-screen-capture";
import GroupAccessModal from "./GroupAccessModal";
import { useToast } from "@/context/ToastContext";

interface Message {
  id: string;
  text?: string;
  sender: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: any;
  replyTo?: {
    sender: string;
    text?: string | null;
    messageId: string;
  } | null;
}
type ReplyInfo = {
  id: string;
  text?: string;
  sender: string;
};
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
  const [modalVisible, setModalVisible] = useState(true);
  const [replyToMessage, setReplyToMessage] = useState<ReplyInfo | null>(null);
  // const navigation = useNavigation();
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        const userId = auth.currentUser?.uid;
        const adminId = "lGVFHXM3YlRehqPKFjU63Ln8aFl1";
        if (userId && !modalVisible && !adminId) {
          const lastSeenRef = doc(db, "groups", groupId, "members", userId);
          setDoc(lastSeenRef, { lastSeen: Timestamp.now() }, { merge: true });
        }
      };
    }, [groupId, modalVisible])
  );

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
      sender: senderName,
      createdAt: Timestamp.now(),
      replyTo: replyToMessage
        ? {
            sender: replyToMessage.sender,
            text: replyToMessage.text || null,
            messageId: replyToMessage.id,
          }
        : null,
    });

    setReplyToMessage(null); // Clear reply

    // 2. Update the group's latestMessageTimestamp
    await setDoc(
      doc(db, "groups", groupId),
      {
        latestMessageTimestamp: Timestamp.now(),
      },
      { merge: true }
    );
    await notifyGroupMembers({
      senderId,
      senderName,
      groupId,
      messageContent: messageText,
    });
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
      // 2. Update the group's latestMessageTimestamp
      await setDoc(
        doc(db, "groups", groupId),
        {
          latestMessageTimestamp: Timestamp.now(),
        },
        { merge: true }
      );
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
      // 2. Update the group's latestMessageTimestamp
      await setDoc(
        doc(db, "groups", groupId),
        {
          latestMessageTimestamp: Timestamp.now(),
        },
        { merge: true }
      );
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

  const requestToJoinPrivateGroup = async (groupId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    const { uid: userId, displayName } = user;

    try {
      const requestRef = doc(db, `groups/${groupId}/joinRequests`, userId);
      await setDoc(requestRef, {
        userId,
        displayName: displayName,
        requestedAt: new Date(),
      });
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  };
  const joinPublicGroup = async (groupId: string, groupName: string) => {
    const user = auth.currentUser;
    if (!user) return;

    const { uid: userId, displayName } = user;
    try {
      const requestRef = doc(db, `groups/${groupId}/members`, userId);
      await setDoc(requestRef, {
        userId,
        displayName: displayName,
        requestedAt: new Date(),
      });
      showToast(`You Joined ${groupName}!`);
      showToast(`Welcome to ${groupName}!`);
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  };
  // const [showToast, setShowToast] = useState(false);
  const { showToast } = useToast();
  const handleCancel = () => {
    showToast("Group join request sent!");

    router.back();
  };
  const handleReply = (message: any) => {
    setReplyToMessage(message);
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={[styles.container, { backgroundColor: BackgroundColor }]}
      keyboardVerticalOffset={100}
    >
      <Text style={[styles.header, { color: TextColor }]}>{groupName}</Text>
      <GroupAccessModal
        visible={modalVisible}
        groupId={groupId}
        groupName={groupName}
        onJoin={() => {
          console.log("Send join request or add to group");
          joinPublicGroup(groupId, groupName);
          setModalVisible(false);
        }}
        onCancel={() => {
          // setModalVisible(false);

          router.back();
        }}
        onAllowed={() => {
          setModalVisible(false);
        }}
        onSendRequest={() => {
          console.log("request send successfully");
          requestToJoinPrivateGroup(groupId);
          handleCancel();
        }}
      />
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
              onLongPress={() => {
                if (isCurrentUser) {
                  Alert.alert(
                    "Message Options",
                    "What do you want to do?",
                    [
                      {
                        text: "Cancel",
                        style: "cancel",
                      },
                      {
                        text: "Reply",
                        onPress: () => handleReply(item),
                      },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => handleDeleteMessage(item.id),
                      },
                    ],
                    { cancelable: true }
                  );
                } else {
                  Alert.alert(
                    "Report Message",
                    "Do you want to report this message?",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Reply",
                        onPress: () => handleReply(item),
                      },
                      { text: "Report", onPress: () => handleReport(item) },
                    ],
                    { cancelable: true }
                  );
                }
              }}
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
                  {item.replyTo && (
                    <View
                      style={{
                        borderLeftWidth: 3,
                        borderLeftColor: "#888",
                        paddingLeft: 8,
                        marginBottom: 4,
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: "bold" }}>
                        Replying to {item.replyTo.sender}
                      </Text>
                      <Text style={{ fontSize: 12 }} numberOfLines={1}>
                        {item.replyTo.text || "[Media]"}
                      </Text>
                    </View>
                  )}
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
      {replyToMessage && (
        <View
          style={{
            backgroundColor: "#f0f0f0",
            padding: 8,
            borderLeftWidth: 4,
            borderLeftColor: "#007AFF",
            marginBottom: 6,
            borderRadius: 6,
          }}
        >
          <Text style={{ fontWeight: "bold" }}>
            Replying to {replyToMessage.sender}
          </Text>
          <Text numberOfLines={1}>{replyToMessage.text || "[Media]"}</Text>
          <TouchableOpacity onPress={() => setReplyToMessage(null)}>
            <Text style={{ color: "red", marginTop: 4 }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

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
