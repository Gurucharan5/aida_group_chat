// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   TextInput,
//   Alert,
//   StyleSheet,
// } from "react-native";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import {
//   doc,
//   getDoc,
//   updateDoc,
//   collection,
//   getDocs,
//   deleteDoc,
//   setDoc,
// } from "firebase/firestore";
// import { db } from "../../firebaseConfig"; // Adjust the path if your firebase config is elsewhere
// import { useAuth } from "@/context/AuthContext";
// import { usePendingRequestsWithUserData } from "@/hooks/usePendingRequestUser";

// export default function GroupSettings() {
//   console.log("coming insinde the group settings");
//   const { id: groupId } = useLocalSearchParams();
//   console.log(groupId, "groupId from params");
//   const router = useRouter();
//   const { user } = useAuth();
//   const { requests, loading } = usePendingRequestsWithUserData(
//     groupId as string
//   );
//   console.log(requests, "requests from hook");
//   const [group, setGroup] = useState<any>(null);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [pendingRequests, setPendingRequests] = useState<any[]>([]);
//   const [groupName, setGroupName] = useState("");

//   // Fetch group data
//   useEffect(() => {
//     const fetchGroup = async () => {
//       const groupRef = doc(db, "groups", groupId as string);
//       const groupSnap = await getDoc(groupRef);

//       if (groupSnap.exists()) {
//         const data = groupSnap.data();
//         console.log(data, "group data fetched");
//         setGroup(data);
//         setGroupName(data.name);
//         setIsAdmin(data.createdBy === user?.uid);

//         // Get pending join requests if admin
//         if (data.createdBy === user?.uid) {
//           const reqSnap = await getDocs(
//             collection(db, "groups", groupId as string, "groupRequests")
//           );
//           setPendingRequests(
//             reqSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
//           );
//         }
//         console.log("Pending Requests:", pendingRequests);
//       }
//     };

//     fetchGroup();
//   }, []);

//   const acceptRequest = async (userToAdd: any) => {
//     const groupRef = doc(db, "groups", groupId as string);

//     if (group.members.includes(userToAdd.uid)) return;

//     await updateDoc(groupRef, {
//       members: [...group.members, userToAdd.uid],
//     });

//     await deleteDoc(
//       doc(db, "groups", groupId as string, "joinRequests", userToAdd.uid)
//     );

//     setPendingRequests((prev) =>
//       prev.filter((req) => req.uid !== userToAdd.uid)
//     );
//   };

//   const rejectRequest = async (userToReject: any) => {
//     await deleteDoc(
//       doc(db, "groups", groupId as string, "joinRequests", userToReject.uid)
//     );
//     setPendingRequests((prev) =>
//       prev.filter((req) => req.uid !== userToReject.uid)
//     );
//   };

//   const leaveGroup = async () => {
//     if (group.adminId === user?.uid) {
//       Alert.alert("Admin cannot leave the group");
//       return;
//     }

//     const groupRef = doc(db, "groups", groupId as string);
//     await updateDoc(groupRef, {
//       members: group.members.filter((uid: string) => uid !== user?.uid),
//     });

//     router.replace("/(tabs)");
//   };

//   const saveGroupName = async () => {
//     const groupRef = doc(db, "groups", groupId as string);
//     await updateDoc(groupRef, {
//       name: groupName,
//     });
//     Alert.alert("Group name updated");
//   };

//   if (!group) return <Text>Loading...</Text>;

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Group Settings</Text>

//       {isAdmin && (
//         <>
//           <Text style={styles.subTitle}>Edit Group Name</Text>
//           <TextInput
//             value={groupName}
//             onChangeText={setGroupName}
//             style={styles.input}
//           />
//           <TouchableOpacity style={styles.button} onPress={saveGroupName}>
//             <Text style={styles.buttonText}>Save</Text>
//           </TouchableOpacity>

//           <Text style={styles.subTitle}>Pending Requests</Text>
//           {requests.length === 0 ? (
//             <Text>No pending requests</Text>
//           ) : (
//             <FlatList
//               data={requests}
//               keyExtractor={(item, index) => item.uid ?? index.toString()}
//               renderItem={({ item }) => (
//                 console.log(item, "pending request item"),
//                 (
//                   <View key={item.uid} style={styles.requestItem}>
//                     <Text>{item.username || item.email}</Text>
//                     <View style={styles.requestActions}>
//                       <TouchableOpacity onPress={() => acceptRequest(item)}>
//                         <Text style={styles.accept}>Accept</Text>
//                       </TouchableOpacity>
//                       <TouchableOpacity onPress={() => rejectRequest(item)}>
//                         <Text style={styles.reject}>Reject</Text>
//                       </TouchableOpacity>
//                     </View>
//                   </View>
//                 )
//               )}
//             />
//           )}
//         </>
//       )}

//       <TouchableOpacity style={styles.leaveButton} onPress={leaveGroup}>
//         <Text style={styles.leaveText}>Leave Group</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, backgroundColor: "#fff" },
//   title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
//   subTitle: { fontSize: 18, fontWeight: "600", marginTop: 20 },
//   input: {
//     borderColor: "#ccc",
//     borderWidth: 1,
//     padding: 10,
//     marginTop: 10,
//     borderRadius: 6,
//   },
//   button: {
//     backgroundColor: "#4caf50",
//     marginTop: 10,
//     padding: 10,
//     borderRadius: 6,
//   },
//   buttonText: { color: "#fff", textAlign: "center" },
//   requestItem: {
//     marginTop: 10,
//     padding: 10,
//     backgroundColor: "#f1f1f1",
//     borderRadius: 6,
//   },
//   requestActions: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 6,
//   },
//   accept: { color: "green" },
//   reject: { color: "red" },
//   leaveButton: {
//     marginTop: 40,
//     backgroundColor: "#f44336",
//     padding: 10,
//     borderRadius: 6,
//   },
//   leaveText: { color: "#fff", textAlign: "center" },
// });
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useAuth } from "@/context/AuthContext";
import { usePendingRequestsWithUserData } from "@/hooks/usePendingRequestsWithUserData";
import { sendPushNotification } from "@/helpers/SendNotification";
import { MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { BlurView } from "expo-blur";
import LottieView from "lottie-react-native";

export default function GroupSettings() {
  const { id: groupId } = useLocalSearchParams();

  const router = useRouter();
  const { user } = useAuth();
  const AppAdminId = "lGVFHXM3YlRehqPKFjU63Ln8aFl1";
  //   const { requests, loading } = usePendingRequestsWithUserData(
  //     groupId as string
  //   );
  const { requests, members, loading } = usePendingRequestsWithUserData(
    groupId as string
  );
  // console.log(requests, "requests from hook");
  const [group, setGroup] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupUniqueId, setGroupUniqueId] = useState("");
  const [processLoading, setProcessLoading] = useState(false);

  // Fetch group data
  useEffect(() => {
    const fetchGroup = async () => {
      // console.log(groupId, "groupId from params");
      const groupRef = doc(db, "groups", groupId as string);
      const groupSnap = await getDoc(groupRef);
      // console.log(groupSnap, "groupSnap");
      // console.log("first");
      // console.log(groupSnap.exists(), "groupSnap exists");
      if (groupSnap.exists()) {
        const data = groupSnap.data();
        // console.log(data, "group data fetched");
        setGroup(data);
        setGroupName(data.name);
        setGroupUniqueId(data.uniqueId);
        setIsAdmin(data.createdBy === user?.uid || user?.uid === AppAdminId);
      }
    };

    fetchGroup();
  }, [groupId, user?.uid]);

  const acceptRequest = async (userToAdd: any) => {
    setProcessLoading(true);
    const groupRef = doc(db, "groups", groupId as string);

    if (group.members.includes(userToAdd.uid)) return;

    await updateDoc(groupRef, {
      members: [...group.members, userToAdd.id],
    });

    await deleteDoc(
      doc(db, "groups", groupId as string, "groupRequests", userToAdd.id)
    );
    // ✅ Send notification to the user
    try {
      const userDoc = await getDoc(doc(db, "users", userToAdd.id));
      const token = userDoc.exists() ? userDoc.data().expoPushToken : null;

      if (token) {
        await sendPushNotification(
          token,
          "Request Accepted",
          `Your request to join "${group.name}" has been accepted.`
        );
      }
    } catch (e) {
      console.error("Failed to notify user:", e);
    }
    // ✅ Notify the admin
    try {
      // Option 1: Hardcoded admin ID(s)
      const adminIds = ["lGVFHXM3YlRehqPKFjU63Ln8aFl1"]; // or use group.createdBy

      for (const adminId of adminIds) {
        const adminDoc = await getDoc(doc(db, "users", adminId));
        if (adminDoc.exists() && adminDoc.data().expoPushToken) {
          await sendPushNotification(
            adminDoc.data().expoPushToken,
            "User Added",
            `${userToAdd.displayName || "A user"} was added to "${group.name}".`
          );
        }
      }
    } catch (e) {
      console.error("Failed to notify admin:", e);
    }
    setProcessLoading(false);
  };

  const rejectRequest = async (userToReject: any) => {
    setProcessLoading(true);
    // console.log(userToReject, "userToReject");

    await deleteDoc(
      doc(db, "groups", groupId as string, "groupRequests", userToReject.id)
    );
    setProcessLoading(false);
  };

  const leaveGroup = async () => {
    if (group.createdBy === user?.uid) {
      Alert.alert("Admin cannot leave the group");
      return;
    }

    const groupRef = doc(db, "groups", groupId as string);
    await updateDoc(groupRef, {
      members: group.members.filter((uid: string) => uid !== user?.uid),
    });

    router.replace("/(tabs)");
  };

  const saveGroupName = async () => {
    const groupRef = doc(db, "groups", groupId as string);
    await updateDoc(groupRef, {
      name: groupName,
    });
    Alert.alert("Group name updated");
  };
  const deleteGroup = async () => {
    if (group.createdBy !== user?.uid) {
      Alert.alert("Only the group creator can delete the group");
      return;
    }
    try {
      // Delete the group document
      await deleteDoc(doc(db, "groups", groupId as string));

      // Optionally: delete all messages in that group
      // (If messages are in a subcollection)
      // You'd need a batch delete here.

      alert("Group deleted successfully");
    } catch (error) {
      console.error("Error deleting group: ", error);
    }
  };
  const kickOutUser = async (userId: string) => {
    setProcessLoading(true);
    // console.log(userId, "userId to kick out");
    // console.log(group.createdBy, "group createdBy");
    // console.log(user?.uid, "current user uid");
    if (group.createdBy !== user?.uid) {
      Alert.alert("Only admin can kick out users");
      return;
    }
    await deleteDoc(
      doc(db, "groups", groupId as string, "groupRequests", userId)
    );
    const groupRef = doc(db, "groups", groupId as string);
    await updateDoc(groupRef, {
      members: group.members.filter((uid: string) => uid !== userId),
    });
    setProcessLoading(false);
  };
  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(groupUniqueId as string);
  };
  const deleteAllMessages = async () => {
    const deleteTime = Timestamp.now(); // Save the current time
    Alert.alert("Success", "All messages before now have been deleted.");

    // Background deletion
    setTimeout(async () => {
      try {
        const messagesRef = collection(db, `groups/${groupId}/messages`);
        const snapshot = await getDocs(messagesRef);

        const messagesToDelete = snapshot.docs.filter(
          (doc) => doc.data().createdAt && doc.data().createdAt < deleteTime
        );

        const batchSize = 500;
        let batchCount = 0;

        for (const docSnap of messagesToDelete) {
          await deleteDoc(docSnap.ref);
          batchCount++;

          if (batchCount >= batchSize) {
            await new Promise((res) => setTimeout(res, 500));
            batchCount = 0;
          }
        }

        // console.log("Background deletion complete.");
      } catch (error) {
        console.error("Error during background deletion:", error);
      }
    }, 100); // Delay to allow alert to render first
  };

  if (!group)
    return (
      <BlurView
        intensity={50}
        tint="light"
        style={{
          ...StyleSheet.absoluteFillObject,
          zIndex: 10,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LottieView
          source={require("@/assets/loading.json")}
          style={{ width: 100, height: 100 }}
          autoPlay
          loop
        />
      </BlurView>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Group Settings</Text>

      {isAdmin && (
        <>
          <View style={styles.row}>
            <Text style={styles.subTitle}>Group ID: {groupUniqueId}</Text>
            <TouchableOpacity
              onPress={copyToClipboard}
              style={styles.iconButton}
            >
              <MaterialIcons name="content-copy" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          {/* <Text style={styles.subTitle}>Group ID: {groupUniqueId}</Text> */}
          <Text style={styles.subTitle}>Edit Group Name</Text>
          <TextInput
            value={groupName}
            onChangeText={setGroupName}
            style={styles.input}
            maxLength={15}
          />
          <TouchableOpacity style={styles.button} onPress={saveGroupName}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={deleteAllMessages}
            style={styles.deleteAllButton}
          >
            <Text style={styles.deleteAllText}>Delete All Messages</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={deleteGroup}
            style={styles.deleteAllButton}
          >
            <Text style={styles.deleteAllText}>Delete Group</Text>
          </TouchableOpacity>
          <Text style={styles.subTitle}>Pending Requests</Text>
          {processLoading && (
            <BlurView
              intensity={50}
              tint="light"
              style={{
                ...StyleSheet.absoluteFillObject,
                zIndex: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LottieView
                source={require("@/assets/loading.json")}
                style={{ width: 100, height: 100 }}
                autoPlay
                loop
              />
            </BlurView> // Show a loading indicator while processing requests
          )}
          {loading ? (
            <Text>Loading...</Text>
          ) : requests.length === 0 ? (
            <Text>No pending requests</Text>
          ) : (
            <FlatList
              data={requests}
              keyExtractor={(item, index) => item.uid ?? index.toString()}
              renderItem={({ item }) => {
                // console.log(item, "pending request item");
                return (
                  <View style={styles.requestItem}>
                    <Text>{item.user?.name}</Text>
                    <View style={styles.requestActions}>
                      <TouchableOpacity onPress={() => acceptRequest(item)}>
                        <Text style={styles.accept}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => rejectRequest(item)}>
                        <Text style={styles.reject}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
            />
          )}
          <Text style={styles.subTitle}>Members</Text>
          {members.length === 0 ? (
            <Text>No members yet</Text>
          ) : (
            <FlatList
              data={members}
              keyExtractor={(item, index) => item.uid ?? index.toString()}
              renderItem={({ item }) => (
                <View style={styles.requestItem}>
                  <Text>{item.user?.name}</Text>
                  <View style={styles.requestActions}>
                    {item.uid === group.createdBy ? (
                      <Text style={{ color: "gray" }}>Admin</Text>
                    ) : (
                      <Text style={{ color: "gray" }}>Member</Text>
                    )}
                    {item.uid !== group.createdBy && (
                      <TouchableOpacity onPress={() => kickOutUser(item.uid)}>
                        <Text style={[styles.reject, { color: "red" }]}>
                          Kick
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            />
          )}
        </>
      )}

      <TouchableOpacity style={styles.leaveButton} onPress={leaveGroup}>
        <Text style={styles.leaveText}>Leave Group</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  subTitle: { fontSize: 18, fontWeight: "600", marginTop: 20 },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    marginTop: 10,
    borderRadius: 6,
  },
  button: {
    backgroundColor: "#4caf50",
    marginTop: 10,
    padding: 10,
    borderRadius: 6,
  },
  buttonText: { color: "#fff", textAlign: "center" },
  requestItem: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f1f1f1",
    borderRadius: 6,
  },
  requestActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  accept: { color: "green" },
  reject: { color: "red" },
  leaveButton: {
    marginTop: 40,
    backgroundColor: "#f44336",
    padding: 10,
    borderRadius: 6,
  },
  leaveText: { color: "#fff", textAlign: "center" },
  deleteAllButton: {
    backgroundColor: "#ff4d4d", // red color to indicate destructive action
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 10,
  },

  deleteAllText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  iconButton: {
    marginLeft: 8,
    padding: 4,
  },
});
