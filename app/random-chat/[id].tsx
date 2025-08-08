import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  collection,
  doc,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useAuth } from "@/context/AuthContext";
import RandomChatHeader from "@/components/RandomChatHeader";
import { useTheme } from "@/context/ThemeContext";
import { usePreventScreenCapture } from "expo-screen-capture";

const ChatRoom = () => {
  usePreventScreenCapture();
  const { id } = useLocalSearchParams(); // chat ID from URL
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const { themeConfig } = useTheme();
  const BackgroundColor = themeConfig.background;
  const TextColor = themeConfig.text;
  const ListColor = themeConfig.tab;

  useEffect(() => {
    const chatId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";
    const q = query(
      collection(db, "randomChats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    return unsubscribe;
  }, [id]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    await addDoc(
      collection(
        db,
        "randomChats",
        typeof id === "string" ? id : Array.isArray(id) ? id[0] : "",
        "messages"
      ),
      {
        text: input,
        senderId: user?.uid,
        createdAt: Timestamp.now(),
      }
    );

    setInput("");
  };

  return (
    <View style={[styles.container, { backgroundColor: BackgroundColor }]}>
      <RandomChatHeader />
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.senderId === user?.uid ? styles.own : styles.other,
            ]}
          >
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingVertical: 16 }}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message"
          placeholderTextColor="#888"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatRoom;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0c0c0c",
  },
  messageBubble: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 4,
    maxWidth: "75%",
  },
  own: {
    backgroundColor: "#2f80ed",
    alignSelf: "flex-end",
  },
  other: {
    backgroundColor: "#1f1f1f",
    alignSelf: "flex-start",
  },
  messageText: {
    color: "#fff",
    fontSize: 14,
  },
  inputRow: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#222",
  },
  input: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    padding: 10,
    borderRadius: 20,
    color: "#fff",
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#2f80ed",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  sendText: {
    color: "white",
    fontWeight: "600",
  },
});
