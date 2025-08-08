import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { router, useNavigation } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebaseConfig";
// import dayjs from "dayjs";

type Group = {
  id: string;
  name: string;
  lastMessage?: {
    text?: string;
    timestamp?: any;
  };
};

const AllChats = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const { themeConfig } = useTheme();
  const navigation = useNavigation();
  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  useEffect(() => {
    const fetchGroups = async () => {
      const snapshot = await getDocs(collection(db, "groups"));
      const fetchedGroups: Group[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name ?? "(Unnamed Group)",
          lastMessage: data.lastMessage ?? {},
        };
      });
      setGroups(fetchedGroups);
    };
    fetchGroups();
  }, []);

  const openGroupChat = (groupId: string) => {
    router.push(`/chat/${groupId}`);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: themeConfig.background }]}
    >
      <Text style={[styles.header, { color: themeConfig.text }]}>
        All Group Chats
      </Text>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.groupItem, { borderColor: themeConfig.text }]}
            onPress={() => openGroupChat(item.id)}
          >
            <Text style={[styles.groupName, { color: themeConfig.text }]}>
              {item.name}
            </Text>

            <Text
              style={[styles.lastMessage, { color: themeConfig.text }]}
              numberOfLines={1}
            >
              {item.lastMessage?.text?.trim()
                ? item.lastMessage.text
                : "No messages yet"}
            </Text>

            {item.lastMessage?.timestamp && (
              <Text
                style={[
                  styles.lastMessage,
                  { color: themeConfig.text, fontSize: 12 },
                ]}
              >
                {formatTime(item.lastMessage.timestamp)}
              </Text>
            )}
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default AllChats;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  groupItem: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "600",
  },
  lastMessage: {
    fontSize: 14,
    marginTop: 4,
  },
});
