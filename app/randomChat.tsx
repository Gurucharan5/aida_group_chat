import {
  View,
  Text,
  KeyboardAvoidingView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  Platform,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import VideoMessagePlayer from "@/components/VideoMessagePlayer";
import { usePreventScreenCapture } from "expo-screen-capture";
import { auth, db } from "@/firebaseConfig";
import { useTheme } from "@/context/ThemeContext";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  documentId,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";
import { sendPushNotification } from "@/helpers/SendNotification";
import { pickAndUploadVideo } from "@/helpers/VideoSend";
import { pickAndUploadImage } from "@/helpers/ImageSend";
import { useFocusEffect } from "expo-router";
type Message = {
  id: string;
  message: string;
  senderId: string;
  senderName: string;
  sender: string; // <-- maybe a profile picture URL or user ID
  createdAt: any;
  replyTo?: any; // <-- Firestore timestamp
};
type ReplyInfo = {
  id: string;
  message?: string;
  senderName: string;
};
const randomChat = () => {
  usePreventScreenCapture();
  const currentUserId = auth.currentUser?.uid;
  // const isAdmin = currentUserId === createdBy;
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
  const [newRandom, setNewRandom] = useState(false);
  useEffect(() => {
    const checkRandom = async () => {
      if (!currentUserId) return;
      const userChatDocRef = doc(db, "random_chat", currentUserId);
      const docSnap = await getDoc(userChatDocRef);
      if (!docSnap.exists()) {
        setNewRandom(true);
      }
    };
    checkRandom();
  }, []);
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        const userId = auth.currentUser?.uid;
        const adminId = "lGVFHXM3YlRehqPKFjU63Ln8aFl1";
        if (userId) {
          const lastSeenRef = doc(db, "random_chat", userId);
          setDoc(lastSeenRef, { lastSeen: Timestamp.now() }, { merge: true });
        }
      };
    }, [currentUserId])
  );

  useEffect(() => {
    const senderId = auth.currentUser?.uid;
    const senderName = auth.currentUser?.displayName || "Guest";
    const messageText = newMessage.trim();
    if (!senderId) {
      console.error("User not logged in.");
      return;
    }
    const q = query(
      collection(db, "random_chat", senderId, "messages"),
      orderBy("timestamp", "desc"),
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
  }, [currentUserId]);
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const senderId = auth.currentUser?.uid;
    const senderName = auth.currentUser?.displayName || "Guest";
    const messageText = newMessage.trim();
    if (!senderId) {
      console.error("User not logged in.");
      return;
    }
    setNewMessage("");
    try {
      const messagesRef = collection(db, "random_chat", senderId, "messages");
      await addDoc(messagesRef, {
        senderId,
        senderName,
        message: messageText,
        timestamp: serverTimestamp(),
        replyTo: replyToMessage
          ? {
              sender: replyToMessage.senderName,
              text: replyToMessage.message || null,
              messageId: replyToMessage.id,
            }
          : null,
      });
      await notifySpecificUser({
        senderName: senderName, // or current user’s name
        messageContent: messageText, // your message content
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  const handleReport = async (message: Message) => {
    try {
      const reportRef = doc(collection(db, "reports"));
      await setDoc(reportRef, {
        messageId: message.id,
        currentUserId,
        messageText: message.message,
        senderName: message.senderName,
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
      await addDoc(
        collection(db, "random_chat", senderId as string, "messages"),
        {
          imageUrl: imageUrl,
          senderId: auth.currentUser?.uid,
          senderName: senderName,
          timestamp: serverTimestamp(),
        }
      );
      await notifySpecificUser({
        senderName: senderName, // or current user’s name
        messageContent: "📷 Sent an image", // your message content
      });
    }
  };
  const handleSendVideo = async () => {
    const videoUrl = await pickAndUploadVideo();
    if (videoUrl) {
      const senderId = auth.currentUser?.uid;
      const senderName = auth.currentUser?.displayName || "Guest";
      await addDoc(
        collection(db, "random_chat", senderId as string, "messages"),
        {
          videoUrl: videoUrl,
          senderId: auth.currentUser?.uid,
          senderName: senderName,
          timestamp: serverTimestamp(),
        }
      );
      await notifySpecificUser({
        senderName: senderName, // or current user’s name
        messageContent: "🎥 Sent a video", // your message content
      });
    }
  };

  const notifySpecificUser = async ({
    senderName,
    messageContent,
  }: {
    senderName: string;
    messageContent: string;
  }) => {
    try {
      const userId = "lGVFHXM3YlRehqPKFjU63Ln8aFl1";

      const userSnap = await getDoc(doc(db, "users", userId));
      if (!userSnap.exists()) return;

      const expoPushToken = userSnap.data().expoPushToken;
      if (!expoPushToken) return;

      await sendPushNotification(
        expoPushToken,
        "New Message from Random Chat",
        `${senderName}: ${messageContent}`
      );
    } catch (e) {
      console.error("Notification Error:", e);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    const senderId = auth.currentUser?.uid;
    try {
      await deleteDoc(
        doc(db, "random_chat", senderId as string, "messages", messageId)
      );
      console.log("Deleted");
    } catch (err) {
      console.error("Error deleting:", err);
      Alert.alert("Error", "Could not delete message.");
    }
  };
  const handleReply = (message: any) => {
    setReplyToMessage(message);
  };
  const addRandomChat = async () => {
    if (!currentUserId) return;

    const userChatDocRef = doc(db, "random_chat", currentUserId);
    const docSnap = await getDoc(userChatDocRef);

    if (!docSnap.exists()) {
      // create document with default info if needed
      await setDoc(userChatDocRef, {
        createdAt: Date.now(),
        senderName: auth.currentUser?.displayName,
        userId: currentUserId,
        randomAdminId: "lGVFHXM3YlRehqPKFjU63Ln8aFl1", // replace with actual admin UID
      });
      setNewRandom(false);
    }
  };
  const [nextPersonLoading, setNextPersonLoading] = useState(false);
  const handleMoveToNext = async () => {
    setNextPersonLoading(true);
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const messagesRef = collection(db, "random_chat", userId, "messages");
      const messagesSnap = await getDocs(messagesRef);

      const deletePromises = messagesSnap.docs.map((docSnap) =>
        deleteDoc(docSnap.ref)
      );

      await Promise.all(deletePromises);

      // console.log("Chat history deleted. Ready for next partner!");
      setTimeout(() => {
        setNextPersonLoading(false);
        // console.log("New partner ready!");
        // You can optionally trigger any logic to reinitialize the chat here
      }, 3000);
    } catch (error) {
      console.error("Error deleting chat history:", error);
    }
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={[styles.container, { backgroundColor: BackgroundColor }]}
      keyboardVerticalOffset={100}
    >
      <Text style={[styles.header, { color: TextColor }]}>Random Chat</Text>
      {newRandom ? (
        <TouchableOpacity
          style={{
            padding: 10,
            borderRadius: 8,
            backgroundColor: "blue",
            margin: 10,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={addRandomChat}
        >
          <Text style={{ color: "#FFF" }}>
            Start your Journey and find your person!
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={{
            padding: 10,
            borderRadius: 8,
            backgroundColor: "blue",
            margin: 10,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={handleMoveToNext}
        >
          <Text style={{ color: "#FFF" }}>Move to Next person</Text>
        </TouchableOpacity>
      )}
      {!nextPersonLoading && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>New Person Found</Text>
          <Text style={styles.disclaimerText}>
            You’ve been matched with a new person! Say hi and start chatting 🎉
          </Text>
        </View>
      )}
      {nextPersonLoading ? (
        <View style={{ alignItems: "center", marginTop: 20 }}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={{ marginTop: 10 }}>Finding another person...</Text>
        </View>
      ) : (
        <>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isCurrentUser =
                item.senderName === auth.currentUser?.displayName;
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
                        "Message Options",
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
                        {item.senderName}
                      </Text>

                      {item.message ? (
                        <Text
                          style={[
                            styles.messageText,
                            isCurrentUser
                              ? styles.myMessageText
                              : styles.otherMessageText,
                          ]}
                        >
                          {item.message}
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
                Replying to {replyToMessage.senderName}
              </Text>
              <Text numberOfLines={1}>
                {replyToMessage.message || "[Media]"}
              </Text>
              <TouchableOpacity onPress={() => setReplyToMessage(null)}>
                <Text style={{ color: "red", marginTop: 4 }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
          {!newRandom && (
            <View style={styles.inputRow}>
              <TextInput
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Type a message..."
                placeholderTextColor="#888"
                style={styles.input}
              />
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleSendImage}
              >
                <Text style={styles.iconText}>📷</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleSendVideo}
              >
                <Text style={styles.iconText}>🎥</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                <Text style={styles.sendText}>➤</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </KeyboardAvoidingView>
  );
};

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
  section: {
    padding: 15,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#111827",
  },
  disclaimerText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 22,
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
export default randomChat;
