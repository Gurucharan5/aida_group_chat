// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   StyleSheet,
// } from "react-native";
// import { useLocalSearchParams, useNavigation } from "expo-router";
// import {
//   collection,
//   query,
//   orderBy,
//   onSnapshot,
//   addDoc,
//   serverTimestamp,
//   doc,
//   getDoc,
//   updateDoc,
// } from "firebase/firestore";

// import { db } from "../../firebaseConfig";
// import { useAuth } from "@/context/AuthContext";

// import GroupHeader from "@/components/GroupHeader";

// const ChatScreen = () => {
//   const { id } = useLocalSearchParams();
//   console.log(id, " ----------------id");
//   const navigation = useNavigation();
//   const [messages, setMessages] = useState<any[]>([]);
//   const [text, setText] = useState("");
//   const [groupName, setGroupName] = useState("Group");

//   const { user } = useAuth();
//   const formatTime = (timestamp: any) => {
//     if (!timestamp) return "";
//     const date = timestamp.toDate();
//     return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   };

//   // Fetch group name for header
//   useEffect(() => {
//     if (!id) return;
//     const fetchGroupName = async () => {
//       const docRef = doc(db, "groups", String(id));
//       const snap = await getDoc(docRef);
//       if (snap.exists()) {
//         setGroupName(snap.data().name || "Group");
//       }
//     };
//     fetchGroupName();
//   }, [id]);
//   useEffect(() => {
//     const q = query(
//       collection(db, `groups/${id}/messages`),
//       orderBy("createdAt", "asc")
//     );
//     const unsubscribe = onSnapshot(q, async (snapshot) => {
//       const loadedMessages = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setMessages(loadedMessages);

//       // Mark any messages as seen if needed
//       snapshot.docs.forEach(async (docSnap) => {
//         const data = docSnap.data();
//         if (data.senderId !== user?.uid && !data.seen) {
//           await updateDoc(docSnap.ref, { seen: true });
//         }
//       });
//     });
//     return unsubscribe;
//   }, [id, user?.uid]);
//   // Load messages
//   useEffect(() => {
//     const q = query(
//       collection(db, `groups/${id}/messages`),
//       orderBy("createdAt", "asc")
//     );
//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
//     });
//     return unsubscribe;
//   }, [id]);

//   // Send message
//   const sendMessage = async () => {
//     if (!text.trim()) return;

//     await addDoc(collection(db, `groups/${id}/messages`), {
//       text: text.trim(),
//       createdAt: serverTimestamp(),
//       sender: user?.displayName || "You",
//       senderId: user?.uid,
//     });

//     setText("");
//   };

//   return (
//     <View style={styles.container}>
//       <GroupHeader groupName={groupName} groupId={String(id)} />
//       <FlatList
//         data={messages}
//         renderItem={({ item }) => {
//           const isCurrentUser = item.senderId === user?.uid;

//           return (
//             <View
//               style={[
//                 styles.messageContainer,
//                 isCurrentUser ? styles.messageRight : styles.messageLeft,
//               ]}
//             >
//               <View
//                 style={[
//                   styles.bubble,
//                   isCurrentUser ? styles.bubbleRight : styles.bubbleLeft,
//                 ]}
//               >
//                 <Text style={styles.messageText}>{item.text}</Text>
//                 <View style={styles.metaContainer}>
//                   <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
//                   {isCurrentUser && (
//                     <Text style={styles.seen}>
//                       {item.seen ? "✓ Seen" : "✓ Sent"}
//                     </Text>
//                   )}
//                 </View>
//               </View>
//             </View>
//           );
//         }}
//         keyExtractor={(item) => item.id}
//         contentContainerStyle={{ padding: 16 }}
//       />
//       <View style={styles.inputContainer}>
//         <TextInput
//           style={styles.input}
//           placeholder="Type a message"
//           value={text}
//           onChangeText={setText}
//         />
//         <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
//           <Text style={{ color: "#fff" }}>Send</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  message: {
    marginBottom: 12,
    backgroundColor: "#f2f2f2",
    padding: 10,
    borderRadius: 6,
  },
  sender: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    backgroundColor: "#eee",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#4a90e2",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  messageContainer: {
    flexDirection: "row",
    marginVertical: 4,
  },

  messageLeft: {
    justifyContent: "flex-start",
  },

  messageRight: {
    justifyContent: "flex-end",
  },

  bubble: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 12,
  },

  bubbleLeft: {
    backgroundColor: "#eee",
    borderTopLeftRadius: 0,
  },

  bubbleRight: {
    backgroundColor: "#4a90e2",
    borderTopRightRadius: 0,
  },

  messageText: {
    color: "#000",
  },

  time: {
    fontSize: 10,
    color: "#555",
    marginTop: 4,
  },

  metaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  seen: {
    fontSize: 10,
    color: "#fff",
    marginLeft: 8,
  },
  globe: {
    width: 250,
    height: 250,
  },
  replyPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eee",
    padding: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#2196F3",
    marginBottom: 5,
  },
  replyLabel: { fontWeight: "bold", color: "#555" },
  replyText: { color: "#333", fontSize: 12 },
  cancelReply: { color: "red", marginLeft: 10, fontSize: 16 },
  replyContainer: {
    backgroundColor: "#f1f1f1",
    padding: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#2196F3",
    marginBottom: 4,
  },
  replySender: { fontWeight: "bold", fontSize: 12, color: "#555" },
  replyMessage: { fontSize: 12, color: "#333" },
});
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  limit,
  getDocs,
  where,
  documentId,
  deleteDoc,
} from "firebase/firestore";
import * as Clipboard from "expo-clipboard";
import { db } from "../../firebaseConfig";
import { useAuth } from "@/context/AuthContext";
import GroupHeader from "@/components/GroupHeader";
import { useTheme } from "@/context/ThemeContext";
import { sendPushNotification } from "@/helpers/SendNotification";
import { usePreventScreenCapture } from "expo-screen-capture";
import LottieView from "lottie-react-native";

const ChatScreen = () => {
  usePreventScreenCapture();
  const { id } = useLocalSearchParams();
  console.log(id, "from chat view");
  const { user } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  const { themeConfig } = useTheme();
  const BackgroundColor = themeConfig.background;
  const TextColor = themeConfig.text;
  const ListColor = themeConfig.tab;
  const IconColor = themeConfig.icon;
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [groupName, setGroupName] = useState("Group");
  const [loading, setLoading] = useState(true);
  const animationRef = useRef<LottieView>(null);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any>(null);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  // Inside useEffect after setting messages
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: false });
    }
  }, [messages]);
  // Fetch group name for header
  useEffect(() => {
    if (!id) return;
    const fetchGroupName = async () => {
      const docRef = doc(db, "groups", String(id));
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setGroupName(snap.data().name || "Group");
      }
    };
    fetchGroupName();
  }, [id]);

  // Load messages and mark seen
  useEffect(() => {
    if (!id || !user?.uid) return;

    const q = query(
      collection(db, `groups/${id}/messages`),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const loadedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as {
          text: string;
          createdAt: any;
          sender: string;
          senderId: string;
          seen?: boolean;
        }),
        ref: doc.ref,
      }));
      const orderedMessages = loadedMessages.reverse();
      setMessages(orderedMessages);

      // Mark unseen messages as seen
      for (const msg of loadedMessages) {
        if (msg.senderId !== user.uid && !msg.seen) {
          await updateDoc(msg.ref, { seen: true });
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [id, user?.uid]);

  const toggleSelectMessage = (id: string) => {
    if (selectedMessages.includes(id)) {
      setSelectedMessages(selectedMessages.filter((mid) => mid !== id));
    } else {
      setSelectedMessages([...selectedMessages, id]);
    }
  };

  const handleLongPress = (id: string) => {
    setSelectionMode(true);
    toggleSelectMessage(id);
  };

  const deleteSelectedMessages = async () => {
    try {
      await Promise.all(
        selectedMessages.map((msgId) =>
          deleteDoc(doc(db, `groups/${id}/messages`, msgId))
        )
      );
      setSelectedMessages([]);
      setSelectionMode(false);
    } catch (error) {
      console.error("Error deleting messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!text.trim()) return;

    const message = text.trim(); // Save message before clearing

    setText(""); // Clear input first (for faster UI)
    const senderName = user?.displayName || "You";
    const senderId = user?.uid;
    await addDoc(collection(db, `groups/${id}/messages`), {
      text: message,
      createdAt: serverTimestamp(),
      sender: user?.displayName || "You",
      senderId: user?.uid,
      seen: false,
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            text: replyingTo.text,
            sender: replyingTo.sender,
          }
        : null,
    });
    setReplyingTo(null);
    // Now update the group's lastMessage and updatedAt
    const groupDocRef = doc(db, "groups", String(id));
    await updateDoc(groupDocRef, {
      lastMessage: {
        text: message,
        timestamp: serverTimestamp(),
      },
    });
    await notifyGroupMembers({
      senderId,
      senderName,
      groupId: String(id),
      messageContent: "New Message incoming",
    });
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
  return (
    <View style={[styles.container, { backgroundColor: BackgroundColor }]}>
      <GroupHeader groupName={groupName} groupId={String(id)} />
      {selectionMode && (
        <View
          style={{ flexDirection: "row", padding: 10, backgroundColor: "#fee" }}
        >
          <TouchableOpacity onPress={deleteSelectedMessages}>
            <Text style={{ color: "red" }}>
              Delete ({selectedMessages.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setSelectionMode(false);
              setSelectedMessages([]);
            }}
          >
            <Text style={{ marginLeft: 20 }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <LottieView
            ref={animationRef}
            source={require("@/assets/loading.json")}
            style={styles.globe}
            loop
            autoPlay={true}
          />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          // inverted
          renderItem={({ item }) => {
            const isCurrentUser = item.senderId === user?.uid;
            const isSelected = selectedMessages.includes(item.id);
            return (
              <TouchableOpacity
                onLongPress={() => handleLongPress(item.id)}
                onPress={() => {
                  if (selectionMode) {
                    toggleSelectMessage(item.id); // existing delete selection
                  } else {
                    Alert.alert("Message Options", "", [
                      {
                        text: "Copy",
                        onPress: () => Clipboard.setStringAsync(item.text),
                      },
                      {
                        text: "Reply",
                        onPress: () => setReplyingTo(item),
                      },
                      {
                        text: "Delete",
                        onPress: () => handleLongPress(item.id), // your delete select
                      },
                      { text: "Cancel", style: "cancel" },
                    ]);
                  }
                }}
                style={[
                  styles.messageContainer,
                  isCurrentUser ? styles.messageRight : styles.messageLeft,
                  isSelected && { backgroundColor: "rgba(0, 150, 255, 0.3)" },
                ]}
              >
                <View
                  style={[
                    styles.bubble,
                    isCurrentUser ? styles.bubbleRight : styles.bubbleLeft,
                  ]}
                >
                  {item.replyTo && (
                    <View style={styles.replyContainer}>
                      <Text style={styles.replySender}>
                        {item.replyTo.sender}
                      </Text>
                      <Text style={styles.replyMessage} numberOfLines={1}>
                        {item.replyTo.text}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.messageText}>{item.text}</Text>
                  <View style={styles.metaContainer}>
                    <Text style={styles.time}>
                      {formatTime(item.createdAt)}
                    </Text>
                    {isCurrentUser && (
                      <Text style={styles.seen}>
                        {item.seen ? "✓ Seen" : "✓ Sent"}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }}
          onLayout={() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }}
        />
      )}
      {replyingTo && (
        <View style={styles.replyPreview}>
          <View style={{ flex: 1 }}>
            <Text style={styles.replyLabel}>
              Replying to {replyingTo.sender}
            </Text>
            <Text style={styles.replyText} numberOfLines={1}>
              {replyingTo.text}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setReplyingTo(null)}>
            <Text style={styles.cancelReply}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.inputContainer, { backgroundColor: ListColor }]}>
        <TextInput
          style={styles.input}
          placeholder="Type a message"
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={{ color: "#fff" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatScreen;
