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
  Modal,
  ActivityIndicator,
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
import { StatusBar } from "expo-status-bar";
import { db, auth } from "../../firebaseConfig";
import { useRootNavigationState, useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/context/ThemeContext";
import CustomAlert from "@/components/CustomAlert";
import { updateProfile } from "firebase/auth";
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
  const [visibleModal, setVisibleModal] = useState(false);
  const closeModal = () => setVisibleModal(false);
  const openModal = () => setVisibleModal(true);
  const router = useRouter();
  const { user, logout } = useAuth();
  const navigationState = useRootNavigationState();
  const { isDark } = useTheme();
  const BackgroundColor = isDark ? "#000000" : "#FFFFFF";
  const TextColor = isDark ? "#FFFFFF" : "#000000";
  const ListColor = isDark ? "#4A5c6A" : "#9BA8AB";
  const [activeSegment, setActiveSegment] = useState("yours");
  const [loading, setLoading] = useState(false);
  const [nameModel, setNameModel] = useState(false);
  useEffect(() => {
    if (!navigationState?.key) return;
    if (!user) {
      router.replace("/login");
    }
  }, [user, navigationState]);
  useEffect(() => {
    setLoading(true);
    const user = auth.currentUser;
    if (!user) return;

    const userDocRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      const userData = docSnap.data();
      // console.log("Live user data:", userData);
      if (!userData?.name) {
        setNameModel(true);

        // setLoading(false);
      } else {
        setNameModel(false);
        // setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [user]);
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
      setLoading(false);
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
      // Alert.alert("Please enter a group name");
      setAlertTitle("Creating Group");
      setAlertMessage("Please enter a group name.");
      setAlertVisible(true);
      return;
    }

    const newGroup = newGroupName;
    setNewGroupName("");
    closeModal();
    try {
      const groupRef = await addDoc(collection(db, "groups"), {
        name: newGroup,
        createdAt: new Date(),
        createdBy: auth.currentUser?.uid,
        adminId: auth.currentUser?.uid,
        isPublic,
        blockedUsers: [],
        members: [auth.currentUser?.uid],
      });
      // Ensure the user is logged in and the user ID exists
      const currentUserId = auth.currentUser?.uid;
      if (!currentUserId) {
        setAlertTitle("Error");
        setAlertMessage("You must be logged in to create a group.");
        setAlertVisible(true);
        return;
      }
      // Add the current user to the members collection
      const memberRef = doc(db, `groups/${groupRef.id}/members`, currentUserId);
      await setDoc(memberRef, {
        userId: auth.currentUser?.uid,
        displayName: auth.currentUser?.displayName || "Guest",
        joinedAt: new Date(),
      });
    } catch (error) {
      Alert.alert("Error creating group", (error as Error).message);
    }
  };

  const joinPublicGroup = async (groupId: string, groupName: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    try {
      const requestRef = doc(db, `groups/${groupId}/members`, userId);
      await setDoc(requestRef, {
        userId,
        requestedAt: new Date(),
      });

      // Alert.alert("Added Successfully.");
      setAlertTitle("Joining Group");
      setAlertMessage("Added Successfully.");
      setAlertVisible(true);
      router.push({
        pathname: "/chatroom",
        params: { id: groupId, name: groupName },
      });
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  };

  const requestToJoinPrivateGroup = async (groupId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    const { uid: userId, displayName } = user;

    try {
      const requestRef = doc(db, `groups/${groupId}/joinRequests`, userId);
      await setDoc(requestRef, {
        userId,
        displayName: displayName,
        requestedAt: new Date(),
      });

      // Alert.alert("Join request sent. Please wait for admin approval.");
      setAlertTitle("Join request sent");
      setAlertMessage("Please wait for admin approval.");
      setAlertVisible(true);
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

  // const goToChat = async (groupId: string, groupName: string) => {
  //   setLoading(true);
  //   const selectedGroup = groups.find((g) => g.id === groupId);
  //   const groupRef = doc(db, "groups", groupId);
  //   const groupSnap = await getDoc(groupRef);

  //   if (!groupSnap.exists()) {

  //     setLoading(false);
  //     setAlertTitle("Group not found");
  //     setAlertMessage("The group you are trying to access does not exist.");
  //     setAlertVisible(true); // Show custom alert
  //     return;
  //   }

  //   const groupData = groupSnap.data();
  //   const currentUserId = auth.currentUser?.uid;
  //   const isAdmin = groupData.createdBy === currentUserId;
  //   const isBlocked = groupData.blockedUsers?.some(
  //     (user: { userId: string; displayName: string }) => user.userId === currentUserId
  //   );
  //   if (!currentUserId) {

  //     setLoading(false);
  //     setAlertTitle("Authentication error");
  //     setAlertMessage("You must be logged in to join the group.");
  //     setAlertVisible(true); // Show custom alert
  //     return;
  //   }

  //   const memberDocRef = doc(db, `groups/${groupId}/members`, currentUserId);
  //   const memberSnap = await getDoc(memberDocRef);
  //   if (groupData.isPublic && !memberSnap.exists() && !isAdmin) {

  //     setLoading(false);
  //     setAlertTitle("Group Joining");
  //     setAlertMessage("Please Join Group first.");
  //     setAlertVisible(true);
  //     return;
  //   }
  //   if (
  //     !groupData.isPublic &&
  //     !memberSnap.exists() &&
  //     !isAdmin &&
  //     !isBlocked
  //   ) {
  //     setLoading(false);
  //     setAlertTitle("Join request pending");
  //     setAlertMessage(
  //       "You must be approved by the group admin to join this private group."
  //     );
  //     setAlertVisible(true);
  //     return;
  //   }

  //   if (isBlocked) {
  //     setLoading(false);
  //     setAlertTitle("Access Denied");
  //     setAlertMessage("You have been blocked from this group.");
  //     setAlertVisible(true);
  //     return;
  //   }
  //   setLoading(false);
  //   router.push({
  //     pathname: "/chatroom",
  //     params: {
  //       id: groupId,
  //       name: groupName,
  //       createdBy: selectedGroup?.createdBy,
  //     },
  //   });
  // };

  const goToChat = async (groupId: string, groupName: string) => {
    setLoading(true);
    const currentUserId = auth.currentUser?.uid;

    if (!currentUserId) {
      setLoading(false);
      setAlertTitle("Authentication error");
      setAlertMessage("You must be logged in to join the group.");
      setAlertVisible(true);
      return;
    }

    const selectedGroup = groups.find((g) => g.id === groupId);
    if (!selectedGroup) {
      setLoading(false);
      setAlertTitle("Group not found");
      setAlertMessage("The group you are trying to access does not exist.");
      setAlertVisible(true);
      return;
    }

    // Fetch group + member data in parallel
    const groupRef = doc(db, "groups", groupId);
    const memberDocRef = doc(db, `groups/${groupId}/members`, currentUserId);
    const [groupSnap, memberSnap] = await Promise.all([
      getDoc(groupRef),
      getDoc(memberDocRef),
    ]);

    if (!groupSnap.exists()) {
      setLoading(false);
      setAlertTitle("Group not found");
      setAlertMessage("The group you are trying to access does not exist.");
      setAlertVisible(true);
      return;
    }

    const groupData = groupSnap.data();
    const isAdmin = groupData.createdBy === currentUserId;

    const isBlocked = groupData.blockedUsers?.some(
      (user: { userId: string; displayName: string }) =>
        user.userId === currentUserId
    );

    if (isBlocked) {
      setLoading(false);
      setAlertTitle("Access Denied");
      setAlertMessage("You have been blocked from this group.");
      setAlertVisible(true);
      return;
    }

    const isMember = memberSnap.exists();

    if (groupData.isPublic && !isMember && !isAdmin) {
      setLoading(false);
      setAlertTitle("Group Joining");
      setAlertMessage("Please Join Group first.");
      setAlertVisible(true);
      return;
    }

    if (!groupData.isPublic && !isMember && !isAdmin) {
      setLoading(false);
      setAlertTitle("Join request pending");
      setAlertMessage(
        "You must be approved by the group admin to join this private group."
      );
      setAlertVisible(true);
      return;
    }

    setLoading(false);
    router.push({
      pathname: "/chatroom",
      params: {
        id: groupId,
        name: groupName,
        createdBy: selectedGroup.createdBy,
      },
    });
  };

  // const [alertVisible, setAlertVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const showAlert = (title: string, message: string) => {
    setAlertVisible(true);
    // You can set the title and message dynamically if needed
  };

  const closeAlert = () => {
    setAlertVisible(false);
  };
  const [username, setUserName] = useState("");
  const handleSaveName = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) return; // 👈 Make sure user is available

    const uid = currentUser.uid;
    if (username.trim() === "") return;

    const userDocRef = doc(db, "users", uid);
    await setDoc(userDocRef, { name: username.trim() }, { merge: true });
    await updateProfile(currentUser, { displayName: username.trim() });
    setNameModel(false);
  };
  return (
    <View style={[styles.container, { backgroundColor: BackgroundColor }]}>
      <StatusBar style="light" />
      {/* Custom Alert Component */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={closeAlert}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginVertical: 15,
        }}
      >
        {isAdmin ? (
          <TouchableOpacity onPress={() => router.push("/AdminDashboard")}>
            <Text style={[styles.title, { color: TextColor, paddingLeft: 5 }]}>
              Your Groups
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.title, { color: TextColor }]}>Your Groups</Text>
        )}

        <TouchableOpacity
          onPress={openModal}
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 5,
            borderRadius: 8,
            backgroundColor: "#457B9D",
          }}
        >
          <Ionicons name="create" size={24} color="white" />
          <Text style={{ fontWeight: "bold", color: "#fff", marginLeft: 5 }}>
            Create Group
          </Text>
        </TouchableOpacity>
      </View>

      {/* Segment Tabs */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            activeSegment === "yours" && styles.activeSegment,
          ]}
          onPress={() => setActiveSegment("yours")}
        >
          <Text
            style={
              activeSegment === "yours"
                ? styles.activeText
                : styles.inactiveText
            }
          >
            Your Groups
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            activeSegment === "all" && styles.activeSegment,
          ]}
          onPress={() => setActiveSegment("all")}
        >
          <Text
            style={
              activeSegment === "all" ? styles.activeText : styles.inactiveText
            }
          >
            All Groups
          </Text>
        </TouchableOpacity>
      </View>
      {loading && (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={{ marginTop: 20 }}
        />
      )}
      <FlatList
        // data={groups}
        data={
          activeSegment === "yours"
            ? groups.filter(
                (group) =>
                  membershipMap[group.id] || group.createdBy === currentUserId
              )
            : groups
        }
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isPublic = item.isPublic;
          const isMember = membershipMap[item.id];
          // const isMember = item.members?.includes(currentUserId);
          const isAdmin = item.createdBy === currentUserId;

          return (
            <TouchableOpacity
              onPress={() => goToChat(item.id, item.name)}
              style={[styles.groupCard, { backgroundColor: ListColor }]}
            >
              <View style={styles.groupHeader}>
                <Text style={[styles.groupName, { color: TextColor }]}>
                  {item.name}
                </Text>
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
      <Modal
        visible={visibleModal}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              // { backgroundColor: hometheme },
            ]}
          >
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Create Group</Text>
            <TextInput
              value={newGroupName}
              onChangeText={setNewGroupName}
              placeholder="Enter group name"
              placeholderTextColor="#bbb"
              maxLength={20}
              style={styles.input}
            />

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Is this group Public?</Text>
              <Switch value={isPublic} onValueChange={setIsPublic} />
            </View>
            <TouchableOpacity
              style={{
                marginBottom: 10,
                padding: 15,
                backgroundColor: "green",
                borderRadius: 12,
              }}
              onPress={handleCreateGroup}
            >
              <Text
                style={{
                  color: "#FFF",
                  fontSize: 16,
                  textAlign: "center",
                }}
              >
                Create Group
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal animationType="slide" transparent={true} visible={nameModel}>
        <View style={styles.modalOverlay}>
          {loading ? (
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Welcome to Aida Group Chat!</Text>
              <ActivityIndicator
                size="large"
                color="#0000ff"
                style={{ marginTop: 20 }}
              />
            </View>
          ) : (
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Please enter your name to continue:
              </Text>

              <TextInput
                placeholder="Your name"
                placeholderTextColor="#bbb"
                value={username}
                onChangeText={setUserName}
                style={styles.input}
              />
              <TouchableOpacity
                style={{
                  marginBottom: 10,
                  padding: 15,
                  backgroundColor: "green",
                  borderRadius: 12,
                }}
                onPress={handleSaveName}
              >
                <Text
                  style={{
                    color: "#FFF",
                    fontSize: 16,
                    textAlign: "center",
                  }}
                >
                  Save Username
                </Text>
              </TouchableOpacity>
              {/* <Button title="Save" onPress={handleSaveName} /> */}
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

export default HomeScreen;
const styles = StyleSheet.create({
  container: { flex: 1, padding: 5, paddingTop: 50 },
  title: { fontSize: 25, fontWeight: "bold", marginTop: 20, marginLeft: 5 },
  input: {
    fontSize: 14,
    padding: 12,
    backgroundColor: "#457B9D",
    borderRadius: 8,
    color: "#FFF",
    width: "100%",
    marginBottom: 10,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    marginRight: 10,
    color: "#FFF",
  },

  groupCard: {
    // backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: 5,
    // alignItems: "center",
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
    flexDirection: "row",
    justifyContent: "flex-start",
    minWidth: 60,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 10,
    textAlign: "center",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1D3557",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: "100%",
    alignItems: "center",
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 10,
  },
  closeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 15,
  },
  segmentContainer: {
    flexDirection: "row",
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    overflow: "hidden",
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  activeSegment: {
    backgroundColor: "#6200ee",
  },
  activeText: {
    color: "#fff",
    fontWeight: "700",
  },
  inactiveText: {
    color: "#333",
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});
