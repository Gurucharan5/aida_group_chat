// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   Button,
//   FlatList,
//   TextInput,
//   Alert,
//   StyleSheet,
//   TouchableOpacity,
//   Switch,
// } from "react-native";
// import {
//   collection,
//   addDoc,
//   onSnapshot,
//   query,
//   orderBy,
//   setDoc,
//   doc,
//   getDoc,
// } from "firebase/firestore";
// import { db, auth } from "../../firebaseConfig";
// import { useRootNavigationState, useRouter } from "expo-router";
// import { useAuth } from "@/context/AuthContext";

// const HomeScreen = () => {
//   const [groups, setGroups] = useState<
//     { id: string; name: string; isPublic: boolean; createdBy: string }[]
//   >([]);
//   const [newGroupName, setNewGroupName] = useState("");
//   const [isPublic, setIsPublic] = useState(true); // Default to public

//   const router = useRouter();
//   // inside component
//   const { user, logout } = useAuth();
//   const navigationState = useRootNavigationState(); // ✅

//   useEffect(() => {
//     if (!navigationState?.key) return;
//     if (!user) {
//       router.replace("/login");
//     }
//   }, [user, navigationState]);

//   useEffect(() => {
//     const q = query(collection(db, "groups"), orderBy("createdAt", "desc"));
//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const list = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         name: doc.data().name,
//         isPublic: doc.data().isPublic, // ✅ fetch isPublic
//         createdBy: doc.data().createdBy, // ✅ fetch createdBy
//       }));
//       setGroups(list);
//     });

//     return unsubscribe;
//   }, []);
//   const joinPublicGroup = (groupId: string, groupName: string) => {
//     router.push({
//       pathname: "/chatroom",
//       params: { id: groupId, name: groupName },
//     });
//   };
//   const requestToJoinPrivateGroup = async (groupId: string) => {
//     const userId = auth.currentUser?.uid;
//     if (!userId) return;

//     try {
//       const requestRef = doc(db, `groups/${groupId}/joinRequests`, userId);
//       await setDoc(requestRef, {
//         userId,
//         requestedAt: new Date(),
//       });

//       Alert.alert("Join request sent. Please wait for admin approval.");
//     } catch (error) {
//       Alert.alert("Error", (error as Error).message);
//     }
//   };
//   const handleCreateGroup = async () => {
//     if (!newGroupName.trim()) {
//       Alert.alert("Please enter a group name");
//       return;
//     }
//     console.log(auth.currentUser?.uid, "=============================");

//     try {
//       await addDoc(collection(db, "groups"), {
//         name: newGroupName,
//         createdAt: new Date(),
//         createdBy: auth.currentUser?.uid,
//         adminId: auth.currentUser?.uid, // ✅ Admin ID
//         isPublic, // default to public, can be updated later
//         blockedUsers: [], // array of user UIDs blocked from this group
//         members: [auth.currentUser?.uid], // array of user UIDs who are members of this group
//       });
//       setNewGroupName("");
//     } catch (error) {
//       Alert.alert("Error creating group", (error as Error).message);
//     }
//   };

//   const goToChat = async (groupId: string, groupName: string) => {
//     // Add createdBy in the group data during fetch
//     const selectedGroup = groups.find((g) => g.id === groupId);
//     const groupRef = doc(db, "groups", groupId);
//     const groupSnap = await getDoc(groupRef);

//     if (!groupSnap.exists()) {
//       Alert.alert("Group not found");
//       return;
//     }

//     const groupData = groupSnap.data();
//     console.log("Group Data:", groupData);
//     const currentUserId = auth.currentUser?.uid;
//     // Check if user is admin
//     const isAdmin = groupData.createdBy === currentUserId;

//     const memberDocRef = doc(
//       db,
//       `groups/${groupId}/members`,
//       currentUserId || ""
//     );
//     const memberSnap = await getDoc(memberDocRef);

//     if (
//       !groupData.isPublic &&
//       !memberSnap.exists() &&
//       !isAdmin &&
//       !groupData.blockedUsers?.includes(currentUserId)
//     ) {
//       // Check if user is already a member{
//       Alert.alert(
//         "Join request pending",
//         "You must be approved by the group admin to join this private group."
//       );
//       return;
//     }

//     if (groupData.blockedUsers?.includes(currentUserId)) {
//       Alert.alert("Access Denied", "You have been blocked from this group.");
//       return;
//     }
//     router.push({
//       pathname: "/chatroom",
//       params: {
//         id: groupId,
//         name: groupName,
//         createdBy: selectedGroup?.createdBy,
//       },
//     });
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Create a Group</Text>

//       <TextInput
//         value={newGroupName}
//         onChangeText={setNewGroupName}
//         placeholder="Enter group name"
//         style={styles.input}
//       />
//       <View style={styles.switchContainer}>
//         <Text style={styles.switchLabel}>Is this group Public?</Text>
//         <Switch
//           value={isPublic}
//           onValueChange={setIsPublic} // Toggle the value
//         />
//       </View>
//       <Button title="Create Group" onPress={handleCreateGroup} />

//       <Text style={styles.title}>Your Groups</Text>

//       <FlatList
//         data={groups}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <TouchableOpacity
//             onPress={() => goToChat(item.id, item.name)}
//             style={styles.groupItem}
//           >
//             <Text style={styles.groupText}>{item.name}</Text>
//             <Text style={styles.groupText}>
//               {item.name} ({item.isPublic ? "Public" : "Private"})
//             </Text>
//             {item.isPublic ? (
//               <Button
//                 title="Join Group"
//                 onPress={() => joinPublicGroup(item.id, item.name)}
//               />
//             ) : (
//               <Button
//                 title="Request to Join"
//                 onPress={() => requestToJoinPrivateGroup(item.id)}
//               />
//             )}
//           </TouchableOpacity>
//         )}
//       />
//     </View>
//   );
// };

// export default HomeScreen;

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, backgroundColor: "#fff" },
//   title: { fontSize: 20, fontWeight: "bold", marginTop: 20 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginVertical: 10,
//   },
//   groupItem: {
//     padding: 15,
//     backgroundColor: "#f0f0f0",
//     marginVertical: 5,
//     borderRadius: 8,
//   },
//   groupText: {
//     fontSize: 16,
//   },
//   switchContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginVertical: 10,
//   },
//   switchLabel: {
//     fontSize: 16,
//     marginRight: 10,
//   },
// });
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from "react-native";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  setDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";
import { useRootNavigationState, useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
// import { usePushNotifications } from "@/utils/notifications";

const HomeScreen = () => {
  const currentUserId = auth.currentUser?.uid;
  // usePushNotifications();

  const [groups, setGroups] = useState<
    { id: string; name: string; isPublic: boolean; createdBy: string }[]
  >([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [membershipMap, setMembershipMap] = useState<{
    [groupId: string]: boolean;
  }>({});
  const [isAdmin, setIsAdmin] = useState(false);

  const [isPublic, setIsPublic] = useState(true);

  const router = useRouter();
  const { user, logout } = useAuth();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;
    if (!user) {
      router.replace("/login");
    }
  }, [user, navigationState]);
  useEffect(() => {
    const fetchAdminStatus = async () => {
      const isAdmin = await checkIfUserIsAdmin();
      // console.log("Is Admin:", isAdmin);
      setIsAdmin(isAdmin);
      // Do something with the result (e.g., set state)
    };

    fetchAdminStatus();
  }, []);
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
      const map: { [groupId: string]: boolean } = {};
      await Promise.all(
        list.map(async (group) => {
          const isMember = await checkMembership(group.id);
          map[group.id] = isMember;
        })
      );
      setMembershipMap(map);
      // console.log("Membership Map:", map);
    });

    return unsubscribe;
  }, []);
  const checkIfUserIsAdmin = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return false;

    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        return data.isAdmin === true;
      } else {
        console.log("User document not found");
        return false;
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  };
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      Alert.alert("Please enter a group name");
      return;
    }

    try {
      await addDoc(collection(db, "groups"), {
        name: newGroupName,
        createdAt: new Date(),
        createdBy: auth.currentUser?.uid,
        adminId: auth.currentUser?.uid,
        isPublic,
        blockedUsers: [],
        members: [auth.currentUser?.uid],
      });
      setNewGroupName("");
    } catch (error) {
      Alert.alert("Error creating group", (error as Error).message);
    }
  };

  const joinPublicGroup = (groupId: string, groupName: string) => {
    router.push({
      pathname: "/chatroom",
      params: { id: groupId, name: groupName },
    });
  };

  const requestToJoinPrivateGroup = async (groupId: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      const requestRef = doc(db, `groups/${groupId}/joinRequests`, userId);
      await setDoc(requestRef, {
        userId,
        requestedAt: new Date(),
      });

      Alert.alert("Join request sent. Please wait for admin approval.");
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  };
  // Step 1: Define the checkMembership function inside your component
  const checkMembership = async (groupId: string): Promise<boolean> => {
    const docRef = doc(
      db,
      `groups/${groupId}/members/${auth.currentUser?.uid}`
    );
    const snap = await getDoc(docRef);
    return snap.exists();
  };

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
    const isAdmin = groupData.createdBy === currentUserId;

    const memberDocRef = doc(
      db,
      `groups/${groupId}/members`,
      currentUserId || ""
    );
    const memberSnap = await getDoc(memberDocRef);

    if (
      !groupData.isPublic &&
      !memberSnap.exists() &&
      !isAdmin &&
      !groupData.blockedUsers?.includes(currentUserId)
    ) {
      Alert.alert(
        "Join request pending",
        "You must be approved by the group admin to join this private group."
      );
      return;
    }

    if (groupData.blockedUsers?.includes(currentUserId)) {
      Alert.alert("Access Denied", "You have been blocked from this group.");
      return;
    }

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
      {isAdmin ? (
        <TouchableOpacity onPress={() => router.push("/AdminDashboard")}>
          <Text style={styles.title}>Create a Group</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.title}>Create a Group</Text>
      )}

      <TextInput
        value={newGroupName}
        onChangeText={setNewGroupName}
        placeholder="Enter group name"
        style={styles.input}
      />

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Is this group Public?</Text>
        <Switch value={isPublic} onValueChange={setIsPublic} />
      </View>

      <Button title="Create Group" onPress={handleCreateGroup} />

      <Text style={styles.title}>Your Groups</Text>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isPublic = item.isPublic;
          const isMember = membershipMap[item.id];
          // const isMember = item.members?.includes(currentUserId);
          const isAdmin = item.createdBy === currentUserId;

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

              <View style={styles.buttonContainer}>
                {isMember || isAdmin ? (
                  <TouchableOpacity
                    onPress={() => goToChat(item.id, item.name)}
                    style={styles.joinButton}
                  >
                    <Text style={styles.joinButtonText}>Enter Group</Text>
                  </TouchableOpacity>
                ) : isPublic ? (
                  <TouchableOpacity
                    onPress={() => joinPublicGroup(item.id, item.name)}
                    style={styles.joinButton}
                  >
                    <Text style={styles.joinButtonText}>Join Group</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => requestToJoinPrivateGroup(item.id)}
                    style={styles.requestButton}
                  >
                    <Text style={styles.requestButtonText}>Request Access</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export default HomeScreen;
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
