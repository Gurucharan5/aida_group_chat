import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit, doc, getDoc } from "firebase/firestore";
// import { db } from "../../../firebase";
import { useRouter } from "expo-router";
import { db } from "@/firebaseConfig";

const RandomChatList = () => {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const randomChatsRef = collection(db, "random_chat");
        const snapshot = await getDocs(randomChatsRef);

        const chatPreviews = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const userId = docSnap.id;
            // Fetch the document at random_chat/userId/
            const userChatDocRef = doc(db, "random_chat", userId);
            const userChatDocSnap = await getDoc(userChatDocRef);
            const chatData = userChatDocSnap.exists()
              ? userChatDocSnap.data()
              : null;
            const messagesRef = collection(
              db,
              "random_chat",
              userId,
              "messages"
            );
            const q = query(
              messagesRef,
              orderBy("timestamp", "desc"),
              limit(1)
            );
            const messageSnap = await getDocs(q);
            const lastMessage = messageSnap.docs[0]?.data();

            return {
              userId,
              latestMessage: lastMessage?.message || "No messages yet",
              senderName: chatData?.senderName || "Unknown",
            };
          })
        );

        setChats(chatPreviews);
      } catch (error) {
        console.error("Error fetching chats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={chats}
      keyExtractor={(item) => item.userId}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.chatItem}
          onPress={() => router.push(`/admin/random/${item.userId}`)}
        >
          <Text style={styles.name}>{item.senderName}</Text>
          <Text>{item.latestMessage}</Text>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  chatItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  name: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default RandomChatList;
