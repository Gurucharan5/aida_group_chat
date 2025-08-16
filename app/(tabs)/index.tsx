// // import React, { useEffect, useState } from "react";
// // import {
// //   View,
// //   Text,
// //   FlatList,
// //   TextInput,
// //   Alert,
// //   StyleSheet,
// //   TouchableOpacity,
// //   Switch,
// //   Modal,
// //   ActivityIndicator,
// // } from "react-native";
// // import {
// //   collection,
// //   addDoc,
// //   onSnapshot,
// //   query,
// //   orderBy,
// //   setDoc,
// //   doc,
// //   getDoc,
// //   Timestamp,
// // } from "firebase/firestore";
// // import { StatusBar } from "expo-status-bar";
// // import { db, auth } from "../../firebaseConfig";
// // import { useRootNavigationState, useRouter } from "expo-router";
// // import { useAuth } from "@/context/AuthContext";
// // import Ionicons from "@expo/vector-icons/Ionicons";
// // import { useTheme } from "@/context/ThemeContext";
// // import CustomAlert from "@/components/CustomAlert";
// // import { updateProfile } from "firebase/auth";
// // // import { usePushNotifications } from "@/utils/notifications";

// // const HomeScreen = () => {
// //   const currentUserId = auth.currentUser?.uid;
// //   // usePushNotifications();

// //   const [groups, setGroups] = useState<
// //     {
// //       id: string;
// //       name: string;
// //       isPublic: boolean;
// //       createdBy: string;
// //       latestMessageTimestamp?: Timestamp;
// //     }[]
// //   >([]);
// //   const [newGroupName, setNewGroupName] = useState("");
// //   const [membershipMap, setMembershipMap] = useState<{
// //     [groupId: string]: boolean;
// //   }>({});
// //   const [isAdmin, setIsAdmin] = useState(false);

// //   const [isPublic, setIsPublic] = useState(true);
// //   const [visibleModal, setVisibleModal] = useState(false);
// //   const closeModal = () => setVisibleModal(false);
// //   const openModal = () => setVisibleModal(true);
// //   const router = useRouter();
// //   const { user } = useAuth();
// //   const navigationState = useRootNavigationState();
// //   const { isDark } = useTheme();
// //   const BackgroundColor = isDark ? "#000000" : "#FFFFFF";
// //   const TextColor = isDark ? "#FFFFFF" : "#000000";
// //   const ListColor = isDark ? "#4A5c6A" : "#9BA8AB";
// //   const [activeSegment, setActiveSegment] = useState("yours");
// //   const [loading, setLoading] = useState(false);
// //   const [nameModel, setNameModel] = useState(false);
// //   const [unseenMessages, setUnseenMessages] = useState<Record<string, number>>(
// //     {}
// //   );
// //   const [unseenRandomMessages, setUnseenRandomMessages] = useState<
// //     Record<string, number>
// //   >({});
// //   useEffect(() => {
// //     if (!navigationState?.key) return;
// //     if (!user) {
// //       router.replace("/login");
// //     }
// //   }, [user, navigationState]);
// //   useEffect(() => {
// //     let unsubscribe: (() => void) | null = null;

// //     const listenToUnseenMessages = async () => {
// //       const currentUserId = auth.currentUser?.uid;
// //       if (!currentUserId) return;

// //       const randomChatRef = doc(db, "random_chat", currentUserId);
// //       const randomChatSnap = await getDoc(randomChatRef);

// //       const lastSeen = randomChatSnap.exists()
// //         ? randomChatSnap.data().lastSeen?.toDate?.()
// //         : null;

// //       const messagesRef = collection(
// //         db,
// //         "random_chat",
// //         currentUserId,
// //         "messages"
// //       );
// //       const q = query(messagesRef, orderBy("timestamp", "asc"));

// //       unsubscribe = onSnapshot(q, (snapshot) => {
// //         let unseenCount = 0;

// //         snapshot.forEach((doc) => {
// //           const msg = doc.data();
// //           const msgTime = msg.timestamp?.toDate?.();
// //           if (lastSeen && msgTime && msgTime > lastSeen) {
// //             unseenCount++;
// //           }
// //         });

// //         setUnseenRandomMessages((prev) => ({
// //           ...prev,
// //           [currentUserId]: unseenCount,
// //         })); // Update your state here
// //       });
// //     };

// //     listenToUnseenMessages();

// //     return () => {
// //       if (unsubscribe) unsubscribe();
// //     };
// //   }, [currentUserId]);

// //   useEffect(() => {
// //     const unsubscribes: (() => void)[] = [];

// //     const listenToUnseenCounts = async () => {
// //       const currentUserId = auth.currentUser?.uid;
// //       if (!currentUserId) return;

// //       for (let group of groups) {
// //         const groupId = group.id;

// //         // Get lastSeen timestamp for the current user in this group
// //         const memberRef = doc(db, "groups", groupId, "members", currentUserId);
// //         const memberSnap = await getDoc(memberRef);
// //         const lastSeen = memberSnap.exists()
// //           ? memberSnap.data().lastSeen.toDate()
// //           : null;

// //         const messagesRef = collection(db, "groups", groupId, "messages");

// //         let q = query(messagesRef, orderBy("createdAt", "asc"));

// //         const unsubscribe = onSnapshot(q, (snapshot) => {
// //           let unseenCount = 0;

// //           snapshot.forEach((doc) => {
// //             const message = doc.data();
// //             const msgTime = message.createdAt?.toDate();

// //             if (lastSeen && msgTime && msgTime > lastSeen) {
// //               unseenCount++;
// //             }
// //           });

// //           setUnseenMessages((prev) => ({
// //             ...prev,
// //             [groupId]: unseenCount,
// //           }));

// //           // console.log(`Unseen for ${group.name}:`, unseenCount);
// //         });

// //         unsubscribes.push(unsubscribe);
// //       }
// //     };

// //     listenToUnseenCounts();

// //     return () => {
// //       unsubscribes.forEach((unsub) => unsub());
// //     };
// //   }, [groups]);
// //   useEffect(() => {
// //     setLoading(true);
// //     const user = auth.currentUser;
// //     if (!user) return;

// //     const userDocRef = doc(db, "users", user.uid);

// //     const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
// //       const userData = docSnap.data();
// //       // console.log("Live user data:", userData);
// //       if (!userData?.name) {
// //         setNameModel(true);

// //         // setLoading(false);
// //       } else {
// //         setNameModel(false);
// //         // setLoading(false);
// //       }
// //     });

// //     return () => unsubscribe();
// //   }, [user]);
// //   useEffect(() => {
// //     const fetchAdminStatus = async () => {
// //       const isAdmin = await checkIfUserIsAdmin();
// //       // console.log("Is Admin:", isAdmin);
// //       setIsAdmin(isAdmin);
// //       // Do something with the result (e.g., set state)
// //     };

// //     fetchAdminStatus();
// //   }, []);

// //   useEffect(() => {
// //     const q = query(collection(db, "groups"), orderBy("createdAt", "desc"));
// //     const unsubscribe = onSnapshot(q, async (snapshot) => {
// //       const list = snapshot.docs.map((doc) => ({
// //         id: doc.id,
// //         name: doc.data().name,
// //         isPublic: doc.data().isPublic,
// //         createdBy: doc.data().createdBy,
// //       }));
// //       setGroups(list);
// //       // Check membership for each group and build a map
// //       const map: { [groupId: string]: boolean } = {};
// //       await Promise.all(
// //         list.map(async (group) => {
// //           const isMember = await checkMembership(group.id);
// //           map[group.id] = isMember;
// //         })
// //       );
// //       setMembershipMap(map);
// //       // console.log("Membership Map:", map);
// //       setLoading(false);
// //     });

// //     return unsubscribe;
// //   }, []);
// //   const checkIfUserIsAdmin = async () => {
// //     const uid = auth.currentUser?.uid;
// //     if (!uid) return false;

// //     try {
// //       const userRef = doc(db, "users", uid);
// //       const userSnap = await getDoc(userRef);

// //       if (userSnap.exists()) {
// //         const data = userSnap.data();
// //         return data.isAdmin === true;
// //       } else {
// //         console.log("User document not found");
// //         return false;
// //       }
// //     } catch (error) {
// //       console.error("Error checking admin status:", error);
// //       return false;
// //     }
// //   };
// //   const handleCreateGroup = async () => {
// //     if (!newGroupName.trim()) {
// //       // Alert.alert("Please enter a group name");
// //       setAlertTitle("Creating Group");
// //       setAlertMessage("Please enter a group name.");
// //       setAlertVisible(true);
// //       return;
// //     }

// //     const newGroup = newGroupName;
// //     setNewGroupName("");
// //     closeModal();
// //     try {
// //       const groupRef = await addDoc(collection(db, "groups"), {
// //         name: newGroup,
// //         createdAt: new Date(),
// //         createdBy: auth.currentUser?.uid,
// //         adminId: auth.currentUser?.uid,
// //         isPublic,
// //         blockedUsers: [],
// //         members: [auth.currentUser?.uid],
// //       });
// //       // Ensure the user is logged in and the user ID exists
// //       const currentUserId = auth.currentUser?.uid;
// //       if (!currentUserId) {
// //         setAlertTitle("Error");
// //         setAlertMessage("You must be logged in to create a group.");
// //         setAlertVisible(true);
// //         return;
// //       }
// //       // Add the current user to the members collection
// //       const memberRef = doc(db, `groups/${groupRef.id}/members`, currentUserId);
// //       await setDoc(memberRef, {
// //         userId: auth.currentUser?.uid,
// //         displayName: auth.currentUser?.displayName || "Guest",
// //         joinedAt: new Date(),
// //       });
// //     } catch (error) {
// //       Alert.alert("Error creating group", (error as Error).message);
// //     }
// //   };

// //   // Step 1: Define the checkMembership function inside your component
// //   const checkMembership = async (groupId: string): Promise<boolean> => {
// //     const docRef = doc(
// //       db,
// //       `groups/${groupId}/members/${auth.currentUser?.uid}`
// //     );
// //     const snap = await getDoc(docRef);
// //     return snap.exists();
// //   };

// //   const goToChat = async (groupId: string, groupName: string) => {
// //     const selectedGroup = groups.find((g) => g.id === groupId);
// //     if (!selectedGroup) {
// //       setLoading(false);
// //       setAlertTitle("Group not found");
// //       setAlertMessage("The group you are trying to access does not exist.");
// //       setAlertVisible(true);
// //       return;
// //     }

// //     router.push({
// //       pathname: "/chatroom",
// //       params: {
// //         id: groupId,
// //         name: groupName,
// //         createdBy: selectedGroup.createdBy,
// //       },
// //     });
// //   };

// //   // const [alertVisible, setAlertVisible] = useState(false);
// //   const [alertVisible, setAlertVisible] = useState(false);
// //   const [alertTitle, setAlertTitle] = useState("");
// //   const [alertMessage, setAlertMessage] = useState("");
// //   const showAlert = (title: string, message: string) => {
// //     setAlertVisible(true);
// //     // You can set the title and message dynamically if needed
// //   };

// //   const closeAlert = () => {
// //     setAlertVisible(false);
// //   };
// //   const [username, setUserName] = useState("");
// //   const handleSaveName = async () => {
// //     const currentUser = auth.currentUser;

// //     if (!currentUser) return; // 👈 Make sure user is available

// //     const uid = currentUser.uid;
// //     if (username.trim() === "") return;

// //     const userDocRef = doc(db, "users", uid);
// //     await setDoc(userDocRef, { name: username.trim() }, { merge: true });
// //     await updateProfile(currentUser, { displayName: username.trim() });
// //     setNameModel(false);
// //   };
// //   const unseenRandomCount = unseenRandomMessages[currentUserId || ""] || 0;
// //   return (
// //     <View style={[styles.container, { backgroundColor: BackgroundColor }]}>
// //       <StatusBar style="light" />
// //       {/* Custom Alert Component */}
// //       <CustomAlert
// //         visible={alertVisible}
// //         title={alertTitle}
// //         message={alertMessage}
// //         onClose={closeAlert}
// //       />
// //       <View
// //         style={{
// //           flexDirection: "row",
// //           justifyContent: "space-between",
// //           marginVertical: 15,
// //         }}
// //       >
// //         {isAdmin ? (
// //           <TouchableOpacity onPress={() => router.push("/AdminDashboard")}>
// //             <Text style={[styles.title, { color: TextColor, paddingLeft: 5 }]}>
// //               Welcome
// //             </Text>
// //           </TouchableOpacity>
// //         ) : (
// //           <Text style={[styles.title, { color: TextColor }]}>Your Groups</Text>
// //         )}

// //         <TouchableOpacity
// //           onPress={openModal}
// //           style={{
// //             flexDirection: "row",
// //             alignItems: "center",
// //             padding: 5,
// //             borderRadius: 8,
// //             backgroundColor: "#457B9D",
// //           }}
// //         >
// //           <Ionicons name="create" size={24} color="white" />
// //           <Text style={{ fontWeight: "bold", color: "#fff", marginLeft: 5 }}>
// //             Create Group
// //           </Text>
// //         </TouchableOpacity>
// //       </View>

// //       {/* Segment Tabs */}
// //       <View style={styles.segmentContainer}>
// //         <TouchableOpacity
// //           style={[
// //             styles.segmentButton,
// //             activeSegment === "yours" && styles.activeSegment,
// //           ]}
// //           onPress={() => setActiveSegment("yours")}
// //         >
// //           <Text
// //             style={
// //               activeSegment === "yours"
// //                 ? styles.activeText
// //                 : styles.inactiveText
// //             }
// //           >
// //             Your Groups
// //           </Text>
// //         </TouchableOpacity>
// //         <TouchableOpacity
// //           style={[
// //             styles.segmentButton,
// //             activeSegment === "all" && styles.activeSegment,
// //           ]}
// //           onPress={() => setActiveSegment("all")}
// //         >
// //           <Text
// //             style={
// //               activeSegment === "all" ? styles.activeText : styles.inactiveText
// //             }
// //           >
// //             All Groups
// //           </Text>
// //         </TouchableOpacity>
// //       </View>
// //       {loading && (
// //         <ActivityIndicator
// //           size="large"
// //           color="#0000ff"
// //           style={{ marginTop: 20 }}
// //         />
// //       )}
// //       <TouchableOpacity
// //         onPress={() => {
// //           router.push("/randomChat");
// //         }}
// //         style={{
// //           marginHorizontal: 5,
// //           marginVertical: 2,
// //           backgroundColor: ListColor,
// //           borderRadius: 16,
// //           padding: 16,
// //           position: "relative",
// //           shadowColor: "#000",
// //           shadowOffset: { width: 0, height: 2 },
// //           shadowOpacity: 0.1,
// //           shadowRadius: 6,
// //           elevation: 3,
// //         }}
// //       >
// //         {/* Group Name */}
// //         <Text style={{ fontSize: 18, fontWeight: "600", color: TextColor }}>
// //           Random Chat
// //         </Text>

// //         {/* Bottom Row: Public/Private Tag + Action Button */}
// //         <View
// //           style={{
// //             flexDirection: "row",
// //             justifyContent: "space-between",
// //             alignItems: "center",
// //             marginTop: 5,
// //           }}
// //         >
// //           <View
// //             style={{
// //               backgroundColor: "#4caf50",
// //               borderRadius: 8,
// //               paddingHorizontal: 10,
// //               paddingVertical: 4,
// //             }}
// //           >
// //             <Text style={{ color: "#fff", fontSize: 10 }}>
// //               Open for Everyone
// //             </Text>
// //           </View>
// //         </View>

// //         {/* Unseen Messages Badge */}
// //         {unseenRandomCount > 0 && (
// //           <View
// //             style={{
// //               position: "absolute",
// //               top: 10,
// //               right: 10,
// //               backgroundColor: "#ff3b30",
// //               borderRadius: 999,
// //               paddingHorizontal: 8,
// //               paddingVertical: 3,
// //               minWidth: 22,
// //               alignItems: "center",
// //               justifyContent: "center",
// //             }}
// //           >
// //             <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>
// //               {unseenRandomCount}
// //             </Text>
// //           </View>
// //         )}
// //       </TouchableOpacity>
// //       <FlatList
// //         // data={groups}
// //         data={
// //           activeSegment === "yours"
// //             ? groups.filter(
// //                 (group) =>
// //                   membershipMap[group.id] || group.createdBy === currentUserId
// //               )
// //             : groups
// //         }
// //         keyExtractor={(item) => item.id}
// //         renderItem={({ item }) => {
// //           const isPublic = item.isPublic;
// //           const isMember = membershipMap[item.id];
// //           // const isMember = item.members?.includes(currentUserId);
// //           const isAdmin = item.createdBy === currentUserId;
// //           const unseenCount = unseenMessages[item.id] || 0;
// //           // console.log(`Unseen count for ${item.id}: ${unseenCount}`);
// //           return (
// //             <TouchableOpacity
// //               onPress={() => goToChat(item.id, item.name)}
// //               style={{
// //                 marginHorizontal: 5,
// //                 marginVertical: 2,
// //                 backgroundColor: ListColor,
// //                 borderRadius: 16,
// //                 padding: 16,
// //                 position: "relative",
// //                 shadowColor: "#000",
// //                 shadowOffset: { width: 0, height: 2 },
// //                 shadowOpacity: 0.1,
// //                 shadowRadius: 6,
// //                 elevation: 3,
// //               }}
// //             >
// //               {/* Group Name */}
// //               <Text
// //                 style={{ fontSize: 18, fontWeight: "600", color: TextColor }}
// //               >
// //                 {item.name}
// //               </Text>

// //               {/* Bottom Row: Public/Private Tag + Action Button */}
// //               <View
// //                 style={{
// //                   flexDirection: "row",
// //                   justifyContent: "space-between",
// //                   alignItems: "center",
// //                   marginTop: 5,
// //                 }}
// //               >
// //                 <View
// //                   style={{
// //                     backgroundColor: isPublic ? "#4caf50" : "#f44336",
// //                     borderRadius: 8,
// //                     paddingHorizontal: 10,
// //                     paddingVertical: 4,
// //                   }}
// //                 >
// //                   <Text style={{ color: "#fff", fontSize: 10 }}>
// //                     {isPublic ? "Public" : "Private"}
// //                   </Text>
// //                 </View>
// //               </View>

// //               {/* Unseen Messages Badge */}
// //               {unseenCount > 0 && (
// //                 <View
// //                   style={{
// //                     position: "absolute",
// //                     top: 10,
// //                     right: 10,
// //                     backgroundColor: "#ff3b30",
// //                     borderRadius: 999,
// //                     paddingHorizontal: 8,
// //                     paddingVertical: 3,
// //                     minWidth: 22,
// //                     alignItems: "center",
// //                     justifyContent: "center",
// //                   }}
// //                 >
// //                   <Text
// //                     style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}
// //                   >
// //                     {unseenCount}
// //                   </Text>
// //                 </View>
// //               )}
// //             </TouchableOpacity>
// //           );
// //         }}
// //       />
// //       <Modal
// //         visible={visibleModal}
// //         transparent
// //         animationType="slide"
// //         onRequestClose={closeModal}
// //       >
// //         <View style={styles.modalOverlay}>
// //           <View
// //             style={[
// //               styles.modalContent,
// //               // { backgroundColor: hometheme },
// //             ]}
// //           >
// //             <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
// //               <Text style={styles.closeText}>✕</Text>
// //             </TouchableOpacity>

// //             <Text style={styles.modalTitle}>Create Group</Text>
// //             <TextInput
// //               value={newGroupName}
// //               onChangeText={setNewGroupName}
// //               placeholder="Enter group name"
// //               placeholderTextColor="#bbb"
// //               maxLength={20}
// //               style={styles.input}
// //             />

// //             <View style={styles.switchContainer}>
// //               <Text style={styles.switchLabel}>Is this group Public?</Text>
// //               <Switch value={isPublic} onValueChange={setIsPublic} />
// //             </View>
// //             <TouchableOpacity
// //               style={{
// //                 marginBottom: 10,
// //                 padding: 15,
// //                 backgroundColor: "green",
// //                 borderRadius: 12,
// //               }}
// //               onPress={handleCreateGroup}
// //             >
// //               <Text
// //                 style={{
// //                   color: "#FFF",
// //                   fontSize: 16,
// //                   textAlign: "center",
// //                 }}
// //               >
// //                 Create Group
// //               </Text>
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       </Modal>
// //       <Modal animationType="slide" transparent={true} visible={nameModel}>
// //         <View style={styles.modalOverlay}>
// //           {loading ? (
// //             <View style={styles.modalContent}>
// //               <Text style={styles.modalTitle}>Welcome to Aida Group Chat!</Text>
// //               <ActivityIndicator
// //                 size="large"
// //                 color="#0000ff"
// //                 style={{ marginTop: 20 }}
// //               />
// //             </View>
// //           ) : (
// //             <View style={styles.modalContent}>
// //               <Text style={styles.modalTitle}>
// //                 Please enter your name to continue:
// //               </Text>

// //               <TextInput
// //                 placeholder="Your name"
// //                 placeholderTextColor="#bbb"
// //                 value={username}
// //                 onChangeText={setUserName}
// //                 style={styles.input}
// //               />
// //               <TouchableOpacity
// //                 style={{
// //                   marginBottom: 10,
// //                   padding: 15,
// //                   backgroundColor: "green",
// //                   borderRadius: 12,
// //                 }}
// //                 onPress={handleSaveName}
// //               >
// //                 <Text
// //                   style={{
// //                     color: "#FFF",
// //                     fontSize: 16,
// //                     textAlign: "center",
// //                   }}
// //                 >
// //                   Save Username
// //                 </Text>
// //               </TouchableOpacity>
// //               {/* <Button title="Save" onPress={handleSaveName} /> */}
// //             </View>
// //           )}
// //         </View>
// //       </Modal>
// //     </View>
// //   );
// // };

// // export default HomeScreen;
// // const styles = StyleSheet.create({
// //   container: { flex: 1, padding: 5, paddingTop: 50 },
// //   title: { fontSize: 25, fontWeight: "bold", marginTop: 20, marginLeft: 5 },
// //   input: {
// //     fontSize: 14,
// //     padding: 12,
// //     backgroundColor: "#457B9D",
// //     borderRadius: 8,
// //     color: "#FFF",
// //     width: "100%",
// //     marginBottom: 10,
// //   },
// //   switchContainer: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     marginVertical: 10,
// //   },
// //   switchLabel: {
// //     fontSize: 16,
// //     marginRight: 10,
// //     color: "#FFF",
// //   },

// //   groupCard: {
// //     // backgroundColor: "#fff",
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     padding: 16,
// //     borderRadius: 12,
// //     marginVertical: 8,
// //     shadowColor: "#000",
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 4,
// //     elevation: 3,
// //   },
// //   groupHeader: {
// //     flexDirection: "column",
// //     justifyContent: "flex-start",
// //     gap: 5,
// //     // alignItems: "center",
// //     marginBottom: 10,
// //   },
// //   groupName: {
// //     fontSize: 18,
// //     fontWeight: "600",
// //   },
// //   badge: {
// //     paddingHorizontal: 8,
// //     paddingVertical: 4,
// //     borderRadius: 12,
// //     flexDirection: "row",
// //     justifyContent: "flex-start",
// //     minWidth: 60,
// //   },
// //   badgeText: {
// //     color: "#fff",
// //     fontWeight: "600",
// //     fontSize: 10,
// //     textAlign: "center",
// //   },
// //   buttonContainer: {
// //     flexDirection: "row",
// //     justifyContent: "flex-end",
// //   },
// //   joinButton: {
// //     backgroundColor: "#4caf50",
// //     paddingHorizontal: 16,
// //     paddingVertical: 8,
// //     borderRadius: 8,
// //   },
// //   joinButtonText: {
// //     color: "#fff",
// //     fontWeight: "600",
// //   },
// //   requestButton: {
// //     backgroundColor: "#2196f3",
// //     paddingHorizontal: 16,
// //     paddingVertical: 8,
// //     borderRadius: 8,
// //   },
// //   requestButtonText: {
// //     color: "#fff",
// //     fontWeight: "600",
// //   },
// //   modalOverlay: {
// //     flex: 1,
// //     backgroundColor: "rgba(0,0,0,0.6)",
// //     justifyContent: "flex-end",
// //   },
// //   modalContent: {
// //     backgroundColor: "#1D3557",
// //     padding: 20,
// //     borderTopLeftRadius: 20,
// //     borderTopRightRadius: 20,
// //     width: "100%",
// //     alignItems: "center",
// //   },
// //   closeButton: {
// //     alignSelf: "flex-end",
// //     padding: 10,
// //   },
// //   closeText: {
// //     fontSize: 18,
// //     fontWeight: "bold",
// //     color: "#FFF",
// //   },
// //   modalTitle: {
// //     fontSize: 20,
// //     fontWeight: "bold",
// //     color: "#FFF",
// //     marginBottom: 15,
// //   },
// //   segmentContainer: {
// //     flexDirection: "row",
// //     backgroundColor: "#e0e0e0",
// //     borderRadius: 8,
// //     overflow: "hidden",
// //     marginBottom: 5,
// //   },
// //   segmentButton: {
// //     flex: 1,
// //     paddingVertical: 10,
// //     alignItems: "center",
// //   },
// //   activeSegment: {
// //     backgroundColor: "#0077b6",
// //   },
// //   activeText: {
// //     color: "#fff",
// //     fontWeight: "700",
// //   },
// //   inactiveText: {
// //     color: "#333",
// //     fontWeight: "500",
// //   },
// //   modalContainer: {
// //     flex: 1,
// //     backgroundColor: "rgba(0,0,0,0.5)",
// //     justifyContent: "center",
// //     alignItems: "center",
// //   },
// //   unseenBadge: {
// //     backgroundColor: "red",
// //     width: 20,
// //     height: 20,
// //     borderRadius: 10,
// //     justifyContent: "center",
// //     alignItems: "center",
// //     position: "absolute",
// //     top: 10,
// //     right: 10,
// //   },
// //   unseenBadgeText: {
// //     color: "#fff",
// //     fontSize: 12,
// //   },
// // });
// // app/index.tsx
// // import React, { useEffect, useState } from "react";
// // import {
// //   View,
// //   Text,
// //   FlatList,
// //   TouchableOpacity,
// //   ActivityIndicator,
// //   StyleSheet,
// // } from "react-native";
// // import { Ionicons } from "@expo/vector-icons";
// // import { router } from "expo-router";
// // import { useAuth } from "@/context/AuthContext";
// // import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
// // import { db } from "@/firebaseConfig";

// // const Index = () => {
// //   const { user } = useAuth();
// //   console.log(user, "----------------index");
// //   const [segment, setSegment] = useState<"your" | "all">("your");
// //   type Group = {
// //     id: string;
// //     name?: string;
// //     lastMessage?: {
// //       text?: string;
// //       timestamp?: any;
// //     };
// //     members?: string[];
// //     [key: string]: any;
// //   };
// //   const [groups, setGroups] = useState<Group[]>([]);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     if (segment === "your") {
// //       loadYourGroups();
// //     } else {
// //       loadAllGroups();
// //     }
// //   }, [segment]);

// //   const loadYourGroups = async () => {
// //     if (!user || !user?.uid) {
// //       setGroups([]);
// //       setLoading(false);
// //       return;
// //     }
// //     setLoading(true);
// //     const q = query(
// //       collection(db, "groups"),
// //       where("members", "array-contains", user.uid),
// //       orderBy("lastMessage.timestamp", "desc")
// //     );
// //     const snapshot = await getDocs(q);
// //     setGroups(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
// //     setLoading(false);
// //   };

// //   const loadAllGroups = async () => {
// //     setLoading(true);
// //     const q = query(
// //       collection(db, "groups"),
// //       orderBy("lastMessage.timestamp", "desc")
// //     );
// //     const snapshot = await getDocs(q);
// //     setGroups(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
// //     setLoading(false);
// //   };

// //   const renderItem = ({ item }) => (
// //     <TouchableOpacity
// //       onPress={() => router.push(`/chat/${item.id}`)}
// //       style={styles.chatItem}
// //     >
// //       <View>
// //         <Text style={styles.chatName}>{item.name}</Text>
// //         <Text style={styles.chatMessage} numberOfLines={1}>
// //           {item.lastMessage?.text || "No messages yet"}
// //         </Text>
// //       </View>
// //       <Text style={styles.chatTime}>
// //         {item.lastMessage?.timestamp?.toDate()?.toLocaleTimeString([], {
// //           hour: "2-digit",
// //           minute: "2-digit",
// //         })}
// //       </Text>
// //     </TouchableOpacity>
// //   );

// //   return (
// //     <View style={styles.container}>
// //       {/* Header */}
// //       <View style={styles.header}>
// //         <Text style={styles.welcomeText}>Welcome, {user?.displayName}</Text>
// //         <TouchableOpacity
// //           onPress={() => router.push("/createGroup")}
// //           style={styles.addButton}
// //         >
// //           <Ionicons name="add" size={24} color="white" />
// //         </TouchableOpacity>
// //       </View>

// //       {/* Segments */}
// //       <View style={styles.segmentContainer}>
// //         <TouchableOpacity
// //           onPress={() => setSegment("your")}
// //           style={[
// //             styles.segmentButton,
// //             segment === "your" && styles.segmentActive,
// //           ]}
// //         >
// //           <Text
// //             style={[
// //               styles.segmentText,
// //               segment === "your" && styles.segmentTextActive,
// //             ]}
// //           >
// //             Your Groups
// //           </Text>
// //         </TouchableOpacity>
// //         <TouchableOpacity
// //           onPress={() => setSegment("all")}
// //           style={[
// //             styles.segmentButton,
// //             segment === "all" && styles.segmentActive,
// //           ]}
// //         >
// //           <Text
// //             style={[
// //               styles.segmentText,
// //               segment === "all" && styles.segmentTextActive,
// //             ]}
// //           >
// //             All Groups
// //           </Text>
// //         </TouchableOpacity>
// //       </View>

// //       {/* Chat List */}
// //       {loading ? (
// //         <ActivityIndicator
// //           size="large"
// //           style={{ marginTop: 30 }}
// //           color="#3b82f6"
// //         />
// //       ) : (
// //         <FlatList
// //           data={groups}
// //           keyExtractor={(item) => item.id}
// //           renderItem={renderItem}
// //           contentContainerStyle={{ paddingBottom: 100 }}
// //         />
// //       )}
// //     </View>
// //   );
// // };

// // export default Index;

// // // 🎨 Styles
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingTop: 50,
//     paddingBottom: 20,
//     paddingHorizontal: 16,
//     backgroundColor: "#fff",
//   },
//   welcomeText: {
//     fontSize: 20,
//     fontWeight: "bold",
//   },
//   addButton: {
//     backgroundColor: "#3b82f6",
//     padding: 10,
//     borderRadius: 30,
//   },
//   segmentContainer: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     paddingHorizontal: 16,
//     marginBottom: 10,
//   },
//   segmentButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 20,
//     borderRadius: 20,
//     backgroundColor: "#e5e7eb",
//   },
//   segmentActive: {
//     backgroundColor: "#3b82f6",
//   },
//   segmentText: {
//     color: "#374151",
//     fontWeight: "500",
//   },
//   segmentTextActive: {
//     color: "#fff",
//   },
//   chatItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e5e7eb",
//     backgroundColor: "#fff",
//   },
//   chatName: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginBottom: 4,
//   },
//   chatMessage: {
//     fontSize: 14,
//     color: "#6b7280",
//   },
//   chatTime: {
//     fontSize: 12,
//     color: "#9ca3af",
//     marginLeft: 10,
//   },
// });
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   StyleSheet,
//   SafeAreaView,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { router } from "expo-router";
// import { useAuth } from "@/context/AuthContext";
// import {
//   collection,
//   getDocs,
//   query,
//   where,
//   orderBy,
//   DocumentData,
// } from "firebase/firestore";
// import { db } from "../../firebaseConfig";

// type Group = {
//   id: string;
//   name?: string;
//   lastMessage?: {
//     text?: string;
//     timestamp?: any;
//   };
//   members?: string[];
// };

// const Index = () => {
//   const { user, loading: authLoading } = useAuth();
//   const [segment, setSegment] = useState<"your" | "all">("your");
//   const [groups, setGroups] = useState<Group[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!authLoading) {
//       segment === "your" ? loadYourGroups() : loadAllGroups();
//     }
//   }, [segment, authLoading]);

//   const loadYourGroups = async () => {
//     if (!user?.uid) {
//       setGroups([]);
//       setLoading(false);
//       return;
//     }

//     try {
//       setLoading(true);
//       const q = query(
//         collection(db, "groups"),
//         where("members", "array-contains", user.uid),
//         orderBy("lastMessage.timestamp", "desc")
//       );
//       const snapshot = await getDocs(q);
//       const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//       console.log(data, "-----------------your groups");
//       setGroups(data);
//     } catch (err) {
//       console.error("Error loading your groups:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadAllGroups = async () => {
//     try {
//       setLoading(true);
//       const q = query(
//         collection(db, "groups"),
//         orderBy("lastMessage.timestamp", "desc")
//       );
//       const snapshot = await getDocs(q);
//       const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//       setGroups(data);
//     } catch (err) {
//       console.error("Error loading all groups:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderItem = ({ item }: { item: Group }) => (
//     <TouchableOpacity
//       onPress={() => router.push(`/chat/${item.id}`)}
//       style={styles.chatItem}
//     >
//       <View>
//         <Text style={styles.chatName}>{item.name || "Unnamed Group"}</Text>
//         <Text style={styles.chatMessage} numberOfLines={1}>
//           {item.lastMessage?.text || "No messages yet"}
//         </Text>
//       </View>
//       <Text style={styles.chatTime}>
//         {item.lastMessage?.timestamp?.toDate?.().toLocaleTimeString([], {
//           hour: "2-digit",
//           minute: "2-digit",
//         }) ?? ""}
//       </Text>
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={styles.welcomeText}>
//           {user ? `Welcome, ${user.displayName || "User"}` : "Welcome"}
//         </Text>
//         <TouchableOpacity
//           onPress={() => router.push("/createGroup")}
//           style={styles.addButton}
//         >
//           <Ionicons name="add" size={24} color="white" />
//         </TouchableOpacity>
//       </View>

//       {/* Segment Controls */}
//       <View style={styles.segmentContainer}>
//         <TouchableOpacity
//           onPress={() => setSegment("your")}
//           style={[
//             styles.segmentButton,
//             segment === "your" && styles.segmentActive,
//           ]}
//         >
//           <Text
//             style={[
//               styles.segmentText,
//               segment === "your" && styles.segmentTextActive,
//             ]}
//           >
//             Your Groups
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           onPress={() => setSegment("all")}
//           style={[
//             styles.segmentButton,
//             segment === "all" && styles.segmentActive,
//           ]}
//         >
//           <Text
//             style={[
//               styles.segmentText,
//               segment === "all" && styles.segmentTextActive,
//             ]}
//           >
//             All Groups
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* Content */}
//       {loading || authLoading ? (
//         <ActivityIndicator
//           size="large"
//           color="#3b82f6"
//           style={{ marginTop: 30 }}
//         />
//       ) : groups.length === 0 ? (
//         <View style={{ alignItems: "center", marginTop: 40 }}>
//           <Text>No groups found.</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={groups}
//           keyExtractor={(item) => item.id}
//           renderItem={renderItem}
//           contentContainerStyle={{ paddingBottom: 100 }}
//         />
//       )}
//     </SafeAreaView>
//   );
// };

// export default Index;
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
  AppState,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useRootNavigationState } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  DocumentData,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
  onSnapshot,
  arrayUnion,
} from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import { useTheme } from "@/context/ThemeContext";
import { sendPushNotification } from "@/helpers/SendNotification";
import WarningMessage from "@/components/WarningMessage";
import CustomAlert from "@/components/CustomAlert";

type Group = {
  id: string;
  name?: string;
  type?: "public" | "private";
  maxMembers?: number;
  members?: string[];
  lastMessage?: {
    text?: string;
    timestamp?: any;
  };
};

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { themeConfig } = useTheme();
  const BackgroundColor = themeConfig.background;
  const TextColor = themeConfig.text;
  const ListColor = themeConfig.tab;
  const navigationState = useRootNavigationState();
  const [segment, setSegment] = useState<"your" | "all">("your");
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [requestingjoining, setRequestingJoining] = useState(false);

  let currentState = AppState.currentState;
  // console.log(currentState, "-----------------current app state");
  AppState.addEventListener("change", async (nextState) => {
    const user = auth.currentUser;
    // console.log(user, "-----------------current user in app state change");
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    if (nextState === "active") {
      await updateDoc(userRef, { online: true });
    } else if (nextState.match(/inactive|background/)) {
      await updateDoc(userRef, { online: false, lastSeen: serverTimestamp() });
    }

    currentState = nextState;
  });

  const closeAlert = () => {
    setAlertVisible(false);
  };
  useEffect(() => {
    if (!navigationState?.key) return;
    if (!user) {
      router.replace("/login");
    }
  }, [user, navigationState]);
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.uid) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setIsAdmin(data.isAdmin === true);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };

    checkAdminStatus();
  }, [user?.uid]);
  const handleSearchGroup = async () => {
    if (!searchText.trim()) return;

    setSearching(true);
    setSearchResult(null);

    try {
      const q = query(
        collection(db, "groups"),
        where("uniqueId", "==", searchText.trim())
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        setSearchResult({ id: docSnap.id, ...docSnap.data() });
      } else {
        setSearchResult(null);
      }
    } catch (err) {
      console.error("Error searching group:", err);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user?.uid) return;

    const q =
      segment === "your"
        ? query(
            collection(db, "groups"),
            where("members", "array-contains", user.uid),
            orderBy("lastMessage.timestamp", "desc")
          )
        : query(
            collection(db, "groups"),
            where("type", "==", "public"), // Only public groups
            orderBy("lastMessage.timestamp", "desc")
          );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Group[];

      setGroups(data);
      setLoading(false);
    });

    return () => unsubscribe(); // Clean up the listener when segment/user changes
  }, [segment, authLoading, user?.uid]);

  const handleJoinGroup = async (group: Group) => {
    if (!user?.uid) return;

    const isAlreadyMember = group.members?.includes(user.uid);
    if (isAlreadyMember) return router.push(`/chat/${group.id}`);

    const memberCount = group.members?.length || 0;
    const max = group.maxMembers ?? 50;

    if (memberCount >= max) {
      return Alert.alert("Group is full");
    }

    if (group.type === "private") {
      const requestRef = doc(db, "groups", group.id, "groupRequests", user.uid);
      await setDoc(requestRef, {
        status: "pending",
        requestedAt: serverTimestamp(),
        id: user.uid,
      });
      Alert.alert("Join request sent to admin");
    } else {
      const groupRef = doc(db, "groups", group.id);
      await updateDoc(groupRef, {
        members: [...(group.members || []), user.uid],
      });
      // Alert.alert("You joined the group!");
      setAlertTitle("Success");
      setAlertMessage("You have successfully joined the group!");
      setAlertVisible(true);
      // loadAllGroups();
    }
  };

  const renderItem = ({ item }: { item: Group }) => {
    // console.log(item, "-----------------renderItem");
    const isMember = item.members?.includes(user?.uid ?? "");
    const time = item.lastMessage?.timestamp
      ?.toDate?.()
      .toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

    return (
      <View style={styles.chatItem}>
        <TouchableOpacity
          onPress={() =>
            isMember ? router.push(`/chat/${item.id}`) : handleJoinGroup(item)
          }
          style={{ flex: 1 }}
        >
          <Text style={[styles.chatName, { color: TextColor }]}>
            {item.name || "Unnamed Group"}
          </Text>
          {item.type === "private" ? (
            <Text style={styles.chatMessage} numberOfLines={1}>
              {item.lastMessage?.text || "No messages yet"}
            </Text>
          ) : (
            <Text style={styles.chatMessage} numberOfLines={1}>
              Public Group
            </Text>
          )}
        </TouchableOpacity>

        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.chatTime}>{time || ""}</Text>
          {segment === "all" && !isMember && (
            <TouchableOpacity
              onPress={() => handleJoinGroup(item)}
              style={styles.joinButton}
            >
              <Text style={styles.joinText}>
                {item.type === "private" ? "Request" : "Join"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: BackgroundColor }]}
    >
      {/* Header */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={closeAlert}
      />
      <View style={styles.header}>
        {isAdmin ? (
          <TouchableOpacity onPress={() => router.push("/admin/all-chats")}>
            <Text style={[styles.welcomeText, { color: TextColor }]}>
              {user ? `Welcome, ${user.displayName || "User"}` : "Welcome"}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.welcomeText, { color: TextColor }]}>
            {user ? `Welcome, ${user.displayName || "User"}` : "Welcome"}
          </Text>
        )}

        <TouchableOpacity
          onPress={() => router.push("/createGroup")}
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Segment */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          onPress={() => setSegment("your")}
          style={[
            styles.segmentButton,
            segment === "your" && styles.segmentActive,
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              segment === "your" && styles.segmentTextActive,
            ]}
          >
            Your Groups
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSegment("all")}
          style={[
            styles.segmentButton,
            segment === "all" && styles.segmentActive,
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              segment === "all" && styles.segmentTextActive,
            ]}
          >
            Public Groups
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading || authLoading ? (
        <ActivityIndicator
          size="large"
          color="#3b82f6"
          style={{ marginTop: 30 }}
        />
      ) : groups.length === 0 ? (
        <View style={{ alignItems: "center", marginTop: 40 }}>
          <Text>No groups found.</Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
      <Modal
        visible={joinModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setJoinModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Join Group</Text>
            <TextInput
              placeholder="Enter group UniqueId"
              value={searchText}
              onChangeText={setSearchText}
              style={styles.input}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearchGroup}
              disabled={searching}
            >
              <Text style={styles.searchButtonText}>
                {searching ? "Searching..." : "Search"}
              </Text>
            </TouchableOpacity>
            <WarningMessage message="Ask your group Admin for Group UniqueID" />
            {searchResult ? (
              <View style={styles.resultContainer}>
                <Text style={styles.resultText}>
                  Group Name: {searchResult.name}
                </Text>
                <TouchableOpacity
                  style={styles.requestButton}
                  onPress={async () => {
                    try {
                      setRequestingJoining(true);
                      const groupSnap = await getDoc(
                        doc(db, "groups", searchResult.id)
                      );

                      if (!groupSnap.exists()) {
                        setSearchText("");
                        setAlertTitle("Join Request Sent");
                        setAlertMessage(`Group not found`);
                        setAlertVisible(true);
                        return;
                        // return alert("Group not found");
                      }

                      const groupData = groupSnap.data();

                      // 2️⃣ Already a member check
                      if (groupData.members?.includes(user?.uid)) {
                        setSearchText("");
                        setRequestingJoining(false);
                        setAlertTitle("Join Request Sent");
                        setAlertMessage(
                          `Your request to join "${searchResult.name}" has been sent to the admin.`
                        );
                        setAlertVisible(true);
                        return;
                        // return alert("You are already a member in this group");
                      }

                      // 3️⃣ Check if already requested
                      const requestSnap = await getDoc(
                        doc(
                          db,
                          "groups",
                          searchResult.id,
                          "groupRequests",
                          user?.uid as string
                        )
                      );
                      if (requestSnap.exists()) {
                        setSearchText("");
                        setRequestingJoining(false);
                        setAlertTitle("Join Request Sent");
                        setAlertMessage(
                          `You have already sent a join request for this group - "${searchResult.name}" `
                        );
                        setAlertVisible(true);
                        return;
                        // return alert(
                        //   "You have already sent a join request for this group"
                        // );
                      }

                      // 4️⃣ Capacity check
                      const memberCount = groupData.members?.length || 0;
                      const max = groupData.maxMembers ?? 50;
                      if (memberCount >= max) {
                        return alert("Group is full");
                      }

                      // 5️⃣ Create join request
                      const requestRef = doc(
                        db,
                        "groups",
                        searchResult.id,
                        "groupRequests",
                        user?.uid as string
                      );
                      await setDoc(requestRef, {
                        status: "pending",
                        requestedAt: serverTimestamp(),
                        id: user?.uid,
                      });

                      // alert("Join request sent to admin");
                      setSearchText("");
                      setAlertTitle("Join Request Sent");
                      setAlertMessage("Join request sent to admin ");
                      setAlertVisible(true);
                      setRequestingJoining(false);
                      setJoinModalVisible(false);
                    } catch (err) {
                      console.error("Error joining group:", err);
                      alert("Failed to join.");
                    }

                    try {
                      // Option 1: Hardcoded admin ID(s)
                      const adminIds = ["lGVFHXM3YlRehqPKFjU63Ln8aFl1"]; // or use group.createdBy

                      for (const adminId of adminIds) {
                        const adminDoc = await getDoc(
                          doc(db, "users", adminId)
                        );
                        if (
                          adminDoc.exists() &&
                          adminDoc.data().expoPushToken
                        ) {
                          await sendPushNotification(
                            adminDoc.data().expoPushToken,
                            "User Added",
                            `A user was requested to "${searchResult.name}".`
                          );
                        }
                      }
                    } catch (e) {
                      console.error("Failed to notify admin:", e);
                    }
                  }}
                  disabled={requestingjoining}
                >
                  <Text style={styles.requestButtonText}>
                    {requestingjoining ? "Requesting...." : "Request to Join"}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.noResultText}>No group found.</Text>
            )}

            <TouchableOpacity
              onPress={() => setJoinModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setJoinModalVisible(true)}
      >
        <Ionicons name="search" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    paddingTop: 20,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#3b82f6",
    padding: 10,
    borderRadius: 100,
  },
  segmentContainer: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    overflow: "hidden",
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: "#3b82f6",
  },
  segmentText: {
    fontWeight: "500",
    color: "#444",
  },
  segmentTextActive: {
    color: "#fff",
  },
  chatItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
    paddingVertical: 12,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
  },
  chatMessage: {
    color: "#666",
    marginTop: 2,
    maxWidth: "90%",
  },
  chatTime: {
    color: "#999",
    fontSize: 12,
  },
  joinButton: {
    marginTop: 8,
    backgroundColor: "#3b82f6",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  joinText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#3b82f6",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    backgroundColor: "#fff",
    width: "85%",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    width: "100%",
    padding: 10,
    marginVertical: 10,
  },

  searchButton: {
    backgroundColor: "#3b82f6",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },

  searchButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  resultContainer: {
    marginTop: 15,
    alignItems: "center",
  },

  resultText: {
    fontSize: 16,
    marginBottom: 10,
  },

  requestButton: {
    backgroundColor: "#10b981",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },

  requestButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  noResultText: {
    marginTop: 15,
    color: "#666",
  },

  closeButton: {
    marginTop: 15,
  },

  closeButtonText: {
    color: "#3b82f6",
  },
});
