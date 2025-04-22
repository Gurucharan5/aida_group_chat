import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";
import { router } from "expo-router";

const AdminDashboard = () => {
  const [groups, setGroups] = useState<
    { id: string; name: string; isPublic: boolean; createdBy: string }[]
  >([]);
  useEffect(() => {
    const q = query(collection(db, "groups"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        isPublic: doc.data().isPublic,
        createdBy: doc.data().createdBy,
      }));
      setGroups(list);
      // Check membership for each group and build a map
    });

    return unsubscribe;
  }, []);

  const goToChat = async (groupId: string, groupName: string) => {
    const selectedGroup = groups.find((g) => g.id === groupId);
    const groupRef = doc(db, "groups", groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) {
      Alert.alert("Group not found");
      return;
    }

    const groupData = groupSnap.data();
    const currentUserId = auth.currentUser?.uid;
    router.push({
      pathname: "/chatroom",
      params: {
        id: groupId,
        name: groupName,
        createdBy: selectedGroup?.createdBy,
      },
    });
  };
  return (
    <View style={styles.container}>
      <Text>AdminDashboard</Text>
      <TouchableOpacity
        style={{
          padding: 10,
          backgroundColor: "blue",
          borderRadius: 8,
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={()=>{
          router.push("/admin/random")
        }}
      >
        <Text style={{ color: "#FFF" }}>Random Chats Page</Text>
      </TouchableOpacity>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isPublic = item.isPublic;

          return (
            <TouchableOpacity
              onPress={() => goToChat(item.id, item.name)}
              style={styles.groupCard}
            >
              <View style={styles.groupHeader}>
                <Text style={styles.groupName}>{item.name}</Text>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: isPublic ? "#4caf50" : "#f44336" },
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {isPublic ? "Public" : "Private"}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", marginTop: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    marginRight: 10,
  },

  groupCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "600",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  joinButton: {
    backgroundColor: "#4caf50",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  requestButton: {
    backgroundColor: "#2196f3",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  requestButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default AdminDashboard;
