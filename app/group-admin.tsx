import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
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
} from "firebase/firestore";
import { useLocalSearchParams } from "expo-router";
import { auth, db } from "../firebaseConfig";

export default function GroupAdmin() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const currentUserId = auth.currentUser?.uid;
  const [joinRequests, setJoinRequests] = useState<{ userId: string }[]>([]);
  const [members, setMembers] = useState<{ userId: string }[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

  // Inside useEffect

  useEffect(() => {
    if (!groupId) return;

    const reqRef = collection(db, `groups/${groupId}/joinRequests`);
    const unsubReq = onSnapshot(reqRef, (snapshot) => {
      const requests = snapshot.docs.map((doc) => ({
        userId: doc.data().userId,
      }));
      setJoinRequests(requests);
    });

    const membersRef = collection(db, `groups/${groupId}/members`);
    const unsubMembers = onSnapshot(membersRef, (snapshot) => {
      const formattedMembers = snapshot.docs.map((doc) => ({
        userId: doc.id,
        ...doc.data(),
      }));
      setMembers(formattedMembers);
    });

    const groupDocUnsub = onSnapshot(doc(db, "groups", groupId), (docSnap) => {
      const data = docSnap.data();
      if (data?.blockedUsers) {
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

  const approveUser = async (userId: string) => {
    try {
      await setDoc(doc(db, `groups/${groupId}/members`, userId), {
        userId,
        joinedAt: Timestamp.now(),
      });
      await deleteDoc(doc(db, `groups/${groupId}/joinRequests`, userId));
      Alert.alert("User approved");
    } catch (err) {
      Alert.alert("Error approving user", (err as Error).message);
    }
  };

  const blockUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, `groups/${groupId}/members`, userId));
      await updateDoc(doc(db, `groups/${groupId}`), {
        blockedUsers: arrayUnion(userId),
      });
      Alert.alert("User blocked");
    } catch (err) {
      Alert.alert("Error blocking user", (err as Error).message);
    }
  };
  const unblockUser = async (userId: string) => {
    try {
      // 1. Remove user from blockedUsers array
      await updateDoc(doc(db, "groups", groupId), {
        blockedUsers: arrayRemove(userId),
      });

      // 2. Re-add to members subcollection
      await setDoc(doc(db, `groups/${groupId}/members`, userId), {
        userId,
        joinedAt: new Date(),
      });

      Alert.alert("User unblocked and added back to members");
    } catch (err) {
      Alert.alert("Error unblocking user", (err as Error).message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Group Admin Panel</Text>

      <Text style={styles.section}>Join Requests</Text>
      {joinRequests.length === 0 ? (
        <Text style={styles.empty}>No join requests</Text>
      ) : (
        joinRequests.map((req) => (
          <View key={req.userId} style={styles.card}>
            <Text>{req.userId}</Text>
            <Button title="Approve" onPress={() => approveUser(req.userId)} />
          </View>
        ))
      )}

      <Text style={styles.section}>Current Members</Text>
      {members.length === 0 ? (
        <Text style={styles.empty}>No members</Text>
      ) : (
        members.map((member) => (
          <View key={member.userId} style={styles.card}>
            <Text>{member.userId}</Text>
            {member.userId !== currentUserId && (
              <Button
                title="Block"
                color="red"
                onPress={() => blockUser(member.userId)}
              />
            )}
          </View>
        ))
      )}
      <Text style={styles.section}>Blocked Users</Text>
      {blockedUsers.length === 0 ? (
        <Text style={styles.empty}>No blocked users</Text>
      ) : (
        blockedUsers.map((userId) => (
          <View key={userId} style={styles.card}>
            <Text>{userId}</Text>
            <Button title="Unblock" onPress={() => unblockUser(userId)} />
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
