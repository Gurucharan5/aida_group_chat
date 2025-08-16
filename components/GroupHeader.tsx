// components/GroupHeader.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";

interface GroupHeaderProps {
  groupName: string;
  groupId: string;
}

const GroupHeader: React.FC<GroupHeaderProps> = ({ groupName, groupId }) => {
  const router = useRouter();
  const { themeConfig } = useTheme();
  const BackgroundColor = themeConfig.background;
  const TextColor = themeConfig.text;
  const ListColor = themeConfig.tab;
  const IconColor = themeConfig.icon;

  const [members, setMembers] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);


  useEffect(() => {
    const unsubGroup = onSnapshot(doc(db, "groups", groupId), (snap) => {
      if (!snap.exists()) return;
      const groupData = snap.data();
      const memberIds: string[] = groupData?.members || [];

      // Unsubscribe old listeners before adding new
      const unsubUsers: (() => void)[] = [];

      memberIds.forEach((uid) => {
        const unsubUser = onSnapshot(doc(db, "users", uid), (userSnap) => {
          setMembers((prev) => {
            const other = prev.filter((u) => u.id !== uid);
            return [...other, { id: uid, ...userSnap.data() }];
          });
        });
        unsubUsers.push(unsubUser);
      });

      // cleanup users snapshot
      return () => unsubUsers.forEach((u) => u());
    });

    return () => unsubGroup();
  }, [groupId]);

  // 🔹 Format last seen time
  const formatLastSeen = (timestamp: any) => {
    if (!timestamp) return "unknown";
    const now = new Date().getTime();
    const lastSeen = timestamp.toDate().getTime();
    const diff = Math.floor((now - lastSeen) / 60000); // in minutes

    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff} min ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  return (
    <View style={[styles.container, { backgroundColor: BackgroundColor }]}>
      <Text style={[styles.title, { color: TextColor }]}>{groupName}</Text>

      <View style={styles.rightActions}>
        {/* 🔹 Online Users Button */}
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.greenDotButton}
        >
          <View style={styles.greenDot} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push(`/groupSettings/${groupId}`)}
          style={styles.button}
        >
          <Ionicons name="settings-outline" size={24} color={IconColor} />
          <Text style={[styles.buttonText, { color: TextColor }]}>Manage</Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 Modal to show members */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: BackgroundColor }]}
          >
            <Text style={[styles.modalTitle, { color: TextColor }]}>
              Group Members
            </Text>
            <FlatList
              data={members}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.memberRow}>
                  <Text style={[styles.memberName, { color: TextColor }]}>
                    {item.name}
                  </Text>
                  {item.online ? (
                    <Text style={{ color: "green" }}>Online</Text>
                  ) : (
                    <Text style={{ color: TextColor }}>
                      {formatLastSeen(item.lastSeen)}
                    </Text>
                  )}
                </View>
              )}
            />
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={{ color: "#fff" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default GroupHeader;

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff", // optional
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  buttonText: {
    marginLeft: 6,
  },
  rightActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  greenDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "green",
  },
  greenDotButton: {
    marginRight: 10,
    padding: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  memberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  memberName: { fontSize: 16 },
  closeButton: {
    marginTop: 15,
    backgroundColor: "red",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});
