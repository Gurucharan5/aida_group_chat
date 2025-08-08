import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const AllRandomChatsScreen = () => {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "randomChats"),
      async (snapshot) => {
        try {
          const chatsData = await Promise.all(
            snapshot.docs.map(async (docSnap) => {
              const data = docSnap.data();
              const [uid1, uid2] = data.users;

              const user1Doc = await getDoc(doc(db, "users", uid1));
              const user2Doc = await getDoc(doc(db, "users", uid2));

              return {
                id: docSnap.id,
                user1: user1Doc.exists() ? user1Doc.data().name : "Unknown",
                user2: user2Doc.exists() ? user2Doc.data().name : "Unknown",
                lastMessage: data.lastMessage || "No message",
                updatedAt: data.updatedAt?.toDate().toLocaleString() || "N/A",
              };
            })
          );

          setChats(chatsData);
        } catch (error) {
          console.error("Failed to process chat snapshot:", error);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error in snapshot listener:", error);
      }
    );

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

  const handleDelete = async (chatId: string) => {
    Alert.alert("Delete Chat", "Are you sure you want to delete this chat?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "randomChats", chatId));
            setChats((prev) => prev.filter((chat) => chat.id !== chatId));
          } catch (err) {
            console.error("Error deleting chat:", err);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.chatCard}>
      <TouchableOpacity
        style={styles.chatInfo}
        onPress={() => router.push(`/random-chat/${item.id}`)}
      >
        <Text style={styles.users}>
          {item.user1} 💬 {item.user2}
        </Text>
        <Text style={styles.message}>{item.lastMessage}</Text>
        <Text style={styles.time}>{item.updatedAt}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handleDelete(item.id)}>
        <Ionicons name="trash-outline" size={22} color="#f56565" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Random Chats</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#2f80ed" />
      ) : (
        <FlatList
          data={chats}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
};

export default AllRandomChatsScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0c0c0c",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 20,
  },
  chatCard: {
    backgroundColor: "#1f1f1f",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  users: {
    color: "#2f80ed",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  message: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 4,
  },
  time: {
    color: "#888",
    fontSize: 12,
  },
  chatInfo: {
    flex: 1,
    marginRight: 12,
  },
});
