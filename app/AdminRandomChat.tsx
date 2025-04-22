import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/firebaseConfig";


const AdminRandomChat = () => {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);
      try {
        const randomChatsRef = collection(db, "random_chat");
        const snapshot = await getDocs(randomChatsRef);

        const chatPreviews = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const userId = docSnap.id;
            const messagesRef = collection(db, "random_chat", userId, "messages");
            const q = query(messagesRef, orderBy("timestamp", "desc"), limit(1));
            const messageSnap = await getDocs(q);
            const lastMessage = messageSnap.docs[0]?.data();

            return {
              userId,
              latestMessage: lastMessage?.message || "No messages yet",
              senderName: lastMessage?.senderName || "Unknown",
            };
          })
        );

        setChats(chatPreviews);
      } catch (error) {
        console.error("Error fetching chats", error);
      }
      setLoading(false);
    };

    fetchChats();
  }, []);

  const goToPrivateChat = (userId: string, senderName: string) => {
    // navigation.navigate("PrivateChatScreen", { userId, senderName });
  };

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
        <TouchableOpacity style={styles.chatItem} onPress={() => goToPrivateChat(item.userId, item.senderName)}>
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

export default AdminRandomChat;
