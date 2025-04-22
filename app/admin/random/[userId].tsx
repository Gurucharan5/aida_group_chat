import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  deleteDoc,
  doc,
  setDoc,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";
import { pickAndUploadImage } from "@/helpers/ImageSend";
import { pickAndUploadVideo } from "@/helpers/VideoSend";
import { useTheme } from "@/context/ThemeContext";
import VideoMessagePlayer from "@/components/VideoMessagePlayer";
import Ionicons from "@expo/vector-icons/Ionicons";
import { sendPushNotification } from "@/helpers/SendNotification";
// import { db, auth } from "../../../firebase";
type Message = {
  id: string;
  message: string;
  senderId: string;
  senderName: string;
  sender: string; // <-- maybe a profile picture URL or user ID
  createdAt: any; // <-- Firestore timestamp
};
type ReplyInfo = {
  id: string;
  message?: string;
  senderName: string;
};
const PrivateChat = () => {
  const { userId } = useLocalSearchParams();
  const [messages, setMessages] = useState<any[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const [newMessage, setNewMessage] = useState("");
  const [replyToMessage, setReplyToMessage] = useState<ReplyInfo | null>(null);
  const { isDark } = useTheme();
  const BackgroundColor = isDark ? "#000000" : "#FFFFFF";
  const TextColor = isDark ? "#FFFFFF" : "#000000";
  const ListColor = isDark ? "#4A5c6A" : "#9BA8AB";
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, "random_chat", userId as string, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(fetched);
    });

    return () => unsubscribe();
  }, [userId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const messageText = newMessage.trim();
    setNewMessage("");
    await addDoc(collection(db, "random_chat", userId as string, "messages"), {
      message: messageText,
      senderId: auth.currentUser?.uid,
      senderName: "Random", // Admin
      timestamp: serverTimestamp(),
      replyTo: replyToMessage
        ? {
            sender: replyToMessage.senderName,
            text: replyToMessage.message || null,
            messageId: replyToMessage.id,
          }
        : null,
    });
    setReplyToMessage(null);
    await notifySpecificUser({
      senderName: "Random", // or current user’s name
      messageContent: messageText, // your message content
    });
  };
  const handleSendImage = async () => {
    const imageUrl = await pickAndUploadImage();
    if (imageUrl) {
      const senderId = auth.currentUser?.uid;
      const senderName = auth.currentUser?.displayName || "Guest";
      await addDoc(
        collection(db, "random_chat", userId as string, "messages"),
        {
          imageUrl: imageUrl,
          senderId: auth.currentUser?.uid,
          senderName: "Random",
          timestamp: serverTimestamp(),
        }
      );
      await notifySpecificUser({
        senderName: "Random", // or current user’s name
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
        collection(db, "random_chat", userId as string, "messages"),
        {
          videoUrl: videoUrl,
          senderId: auth.currentUser?.uid,
          senderName: "Random",
          timestamp: serverTimestamp(),
        }
      );
      await notifySpecificUser({
        senderName: "Random", // or current user’s name
        messageContent: "🎥 Sent a video", // your message content
      });
    }
  };
  const handleReport = async (message: Message) => {
    try {
      const reportRef = doc(collection(db, "reports"));
      await setDoc(reportRef, {
        messageId: message.id,
        userId,
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
  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteDoc(
        doc(db, "random_chat", userId as string, "messages", messageId)
      );
      // console.log("Deleted");
    } catch (err) {
      console.error("Error deleting:", err);
      Alert.alert("Error", "Could not delete message.");
    }
  };
  const handleReply = (message: any) => {
    setReplyToMessage(message);
  };

  const notifySpecificUser = async ({
    senderName,
    messageContent,
  }: {
    senderName: string;
    messageContent: string;
  }) => {
    try {
      const userSnap = await getDoc(doc(db, "users", userId as string));
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
  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={[styles.container, { backgroundColor: BackgroundColor }]}
      keyboardVerticalOffset={100}
    >
      <Text style={[styles.header, { color: TextColor }]}>Random Chat</Text>
      {/* <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.message}>
            <Text style={styles.sender}>{item.senderName}</Text>
            <Text>{item.message}</Text>
          </View>
        )}
      /> */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isCurrentUser = item.senderName === "Random";
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
          <Text numberOfLines={1}>{replyToMessage.message || "[Media]"}</Text>
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
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  message: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginTop: 5,
  },
  deleteIcon: {
    position: "absolute",
    top: 5,
    right: 5,
    padding: 4,
    zIndex: 1,
  },
  myMessageText: {
    color: "#fff", // white for your messages
  },
  otherMessageText: {
    color: "#000", // black for others
  },
  messageText: {
    fontSize: 16,
    color: "#fff",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
    textAlign: "center",
  },
  sender: {
    fontWeight: "bold",
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
});

export default PrivateChat;
