import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  doc,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  Timestamp,
  arrayRemove,
  getDocs,
} from "firebase/firestore";
import { router, useLocalSearchParams } from "expo-router";
import { auth, db } from "../firebaseConfig";
import { useToast } from "@/context/ToastContext";
type BlockedUser = {
  userId: string;
  displayName: string;
};
export default function GroupAdmin() {
  const { showToast } = useToast();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const currentUserId = auth.currentUser?.uid;
  const [joinRequests, setJoinRequests] = useState<
    { userId: string; displayName: string }[]
  >([]);
  const [members, setMembers] = useState<
    { userId: string; displayName: string }[]
  >([]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);

  // Inside useEffect

  useEffect(() => {
    if (!groupId) return;

    const reqRef = collection(db, `groups/${groupId}/joinRequests`);
    const unsubReq = onSnapshot(reqRef, (snapshot) => {
      const requests = snapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          userId: data.userId,
          displayName: data.displayName, // fallback if missing
        };
      });
      setJoinRequests(requests);
    });

    const membersRef = collection(db, `groups/${groupId}/members`);
    const unsubMembers = onSnapshot(membersRef, (snapshot) => {
      const formattedMembers = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          userId: doc.id,
          displayName: data.displayName,
          joinedAt: data.joinedAt,
        };
      });
      setMembers(formattedMembers);
    });

    const groupDocUnsub = onSnapshot(doc(db, "groups", groupId), (docSnap) => {
      const data = docSnap.data();
      if (data?.blockedUsers) {
        // console.log(data.blockedUsers, "-------------------blocked users");
        setBlockedUsers(data.blockedUsers);
      } else {
        setBlockedUsers([]);
      }
    });

    return () => {
      unsubReq();
      unsubMembers();
      groupDocUnsub();
    };
  }, [groupId]);

  const approveUser = async (userId: string, displayName: string) => {
    try {
      await setDoc(doc(db, `groups/${groupId}/members`, userId), {
        userId,
        displayName,
        joinedAt: Timestamp.now(),
      });
      showToast(`${displayName} Approved!`);
      await deleteDoc(doc(db, `groups/${groupId}/joinRequests`, userId));
      // Alert.alert("User approved");
    } catch (err) {
      Alert.alert("Error approving user", (err as Error).message);
    }
  };

  const blockUser = async (userId: string, displayName: string) => {
    try {
      await deleteDoc(doc(db, `groups/${groupId}/members`, userId));
      await updateDoc(doc(db, `groups/${groupId}`), {
        blockedUsers: arrayUnion({ userId, displayName }),
      });
      // Alert.alert("User blocked");
      showToast(`${displayName} Blocked!`);
    } catch (err) {
      Alert.alert("Error blocking user", (err as Error).message);
    }
  };
  const unblockUser = async (userId: string, displayName: string) => {
    try {
      // 1. Remove user from blockedUsers array
      await updateDoc(doc(db, "groups", groupId), {
        blockedUsers: arrayRemove({ userId, displayName }),
      });

      // 2. Re-add to members subcollection
      await setDoc(doc(db, `groups/${groupId}/members`, userId), {
        userId,
        displayName,
        joinedAt: new Date(),
      });
      showToast(`${displayName} UnBlocked!`);
      // Alert.alert("User unblocked and added back to members");
    } catch (err) {
      Alert.alert("Error unblocking user", (err as Error).message);
    }
  };
  const confirmDeleteMessages = () => {
    Alert.alert(
      "Delete All Messages",
      "Are you sure you want to delete all messages in this group?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: handleDeleteAllMessages,
        },
      ]
    );
  };
  const handleDeleteAllMessages = async () => {
    try {
      const messagesRef = collection(db, `groups/${groupId}/messages`);
      const snapshot = await getDocs(messagesRef);

      const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));

      await Promise.all(deletePromises);
      showToast(`All Messages Deleted!`);
      // Alert.alert("All messages deleted");
    } catch (error) {
      console.error("Error deleting messages:", error);
      Alert.alert("Error", "Failed to delete messages");
    }
  };
  const deleteGroup = async () => {
    try {
      await deleteDoc(doc(db, "groups", groupId));
      showToast("Group deleted Successfully!");
      router.replace("/(tabs)");
      // console.log("Group deleted successfully.");
      // Optionally navigate back or refresh group list
    } catch (error) {
      console.error("Error deleting group:", error);
      Alert.alert("Error", "Failed to delete the group.");
    }
  };
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Group Admin Panel</Text>
      <TouchableOpacity
        style={{
          padding: 8,
          backgroundColor: "red",
          borderRadius: 8,
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={confirmDeleteMessages}
      >
        <Text style={{ color: "#FFF" }}>Delete All Messages</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          padding: 8,
          backgroundColor: "red",
          borderRadius: 8,
          justifyContent: "center",
          alignItems: "center",
          marginTop: 10,
        }}
        onPress={deleteGroup}
      >
        <Text style={{ color: "#FFF" }}>Delete Group</Text>
      </TouchableOpacity>

      <Text style={styles.section}>Join Requests</Text>
      {joinRequests.length === 0 ? (
        <Text style={styles.empty}>No join requests</Text>
      ) : (
        joinRequests.map((req) => (
          <View key={req.userId} style={styles.card}>
            <Text>{req.displayName}</Text>
            <TouchableOpacity
              style={{
                padding: 8,
                backgroundColor: "#007200",
                borderRadius: 8,
              }}
              onPress={() => approveUser(req.userId, req.displayName)}
            >
              <Text style={{ color: "#FFF" }}>Approve</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      <Text style={styles.section}>Current Members</Text>
      {members.length === 0 ? (
        <Text style={styles.empty}>No members</Text>
      ) : (
        members.map((member) => (
          <View key={member.userId} style={styles.card}>
            <Text>{member.displayName}</Text>
            {member.userId !== currentUserId && (
              <TouchableOpacity
                style={{ padding: 8, backgroundColor: "red", borderRadius: 8 }}
                onPress={() => blockUser(member.userId, member.displayName)}
              >
                <Text style={{ color: "#FFF" }}>Block</Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      )}
      <Text style={styles.section}>Blocked Users</Text>
      {blockedUsers.length === 0 ? (
        <Text style={styles.empty}>No blocked users</Text>
      ) : (
        blockedUsers.map((user) => (
          <View key={user.userId} style={styles.card}>
            <Text>{user.displayName}</Text>
            <TouchableOpacity
              style={{ padding: 8, backgroundColor: "blue", borderRadius: 8 }}
              onPress={() => unblockUser(user.userId, user.displayName)}
            >
              <Text style={{ color: "#FFF" }}>UnBlock</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f1f1f1",
    marginBottom: 10,
    borderRadius: 8,
  },
  empty: {
    fontStyle: "italic",
    color: "#777",
  },
});
