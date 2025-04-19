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
  where,
  limit,
  getDocs,
  Timestamp,
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
    { id: string; name: string; isPublic: boolean; createdBy: string,latestMessageTimestamp?: Timestamp}[]
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
  const [unseenMessages, setUnseenMessages] = useState<Record<string, number>>(
    {}
  );
  // const currentUserId = auth.currentUser?.uid;
  useEffect(() => {
    if (!navigationState?.key) return;
    if (!user) {
      router.replace("/login");
    }
  }, [user, navigationState]);

  useEffect(() => {
    const unsubscribes: (() => void)[] = [];

    const listenToUnseenCounts = async () => {
      const currentUserId = auth.currentUser?.uid;
      if (!currentUserId) return;

      for (let group of groups) {
        const groupId = group.id;

        // Get lastSeen timestamp for the current user in this group
        const memberRef = doc(db, "groups", groupId, "members", currentUserId);
        const memberSnap = await getDoc(memberRef);
        const lastSeen = memberSnap.exists()
          ? memberSnap.data().lastSeen.toDate()
          : null;

        const messagesRef = collection(db, "groups", groupId, "messages");

        let q = query(messagesRef, orderBy("createdAt", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          let unseenCount = 0;

          snapshot.forEach((doc) => {
            const message = doc.data();
            const msgTime = message.createdAt?.toDate();

            if (lastSeen && msgTime && msgTime > lastSeen) {
              unseenCount++;
            }
          });

          setUnseenMessages((prev) => ({
            ...prev,
            [groupId]: unseenCount,
          }));

          // console.log(`Unseen for ${group.name}:`, unseenCount);
        });

        unsubscribes.push(unsubscribe);
      }
    };

    listenToUnseenCounts();

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [groups]);
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
    if (!selectedGroup) {
      setLoading(false);
      setAlertTitle("Group not found");
      setAlertMessage("The group you are trying to access does not exist.");
      setAlertVisible(true);
      return;
    }

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
        data={(activeSegment === "yours"
          ? groups.filter(
              (group) =>
                membershipMap[group.id] || group.createdBy === currentUserId
            )
          : groups
        )
          // .slice() // Make a copy so we don't mutate the original array
          // .sort((a:any, b:any) => {
          //   const timeA = a.latestMessageTimestamp?.toMillis?.() || 0;
          //   const timeB = b.latestMessageTimestamp?.toMillis?.() || 0;
          //   return timeB - timeA; // descending (latest first)
          // })
        }
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isPublic = item.isPublic;
          const isMember = membershipMap[item.id];
          // const isMember = item.members?.includes(currentUserId);
          const isAdmin = item.createdBy === currentUserId;
          const unseenCount = unseenMessages[item.id] || 0;
          // console.log(`Unseen count for ${item.id}: ${unseenCount}`);
          return (
            <TouchableOpacity
              onPress={() => goToChat(item.id, item.name)}
              style={{
                marginHorizontal: 5,
                marginVertical: 2,
                backgroundColor: ListColor,
                borderRadius: 16,
                padding: 16,
                position: "relative",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              {/* Group Name */}
              <Text
                style={{ fontSize: 18, fontWeight: "600", color: TextColor }}
              >
                {item.name}
              </Text>

              {/* Bottom Row: Public/Private Tag + Action Button */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 5,
                }}
              >
                <View
                  style={{
                    backgroundColor: isPublic ? "#4caf50" : "#f44336",
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 10 }}>
                    {isPublic ? "Public" : "Private"}
                  </Text>
                </View>
              </View>

              {/* Unseen Messages Badge */}
              {unseenCount > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    backgroundColor: "#ff3b30",
                    borderRadius: 999,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    minWidth: 22,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}
                  >
                    {unseenCount}
                  </Text>
                </View>
              )}
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
    marginBottom: 5,
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
  unseenBadge: {
    backgroundColor: "red",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 10,
    right: 10,
  },
  unseenBadgeText: {
    color: "#fff",
    fontSize: 12,
  },
});
