// import React, { useRef, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   Modal,
//   Pressable,
// } from "react-native";
// import LottieView from "lottie-react-native";
// import { useRouter } from "expo-router";

// const WorldScreen = () => {
//   const animationRef = useRef<LottieView>(null);
//   const [loading, setLoading] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const router = useRouter();

//   const handleFindFriends = () => {
//     setLoading(true);
//     animationRef.current?.play();

//     setTimeout(() => {
//       animationRef.current?.pause();
//       setLoading(false);
//       setShowModal(true); // Show success popup
//     }, 3000);
//   };

//   const handleStartChat = () => {
//     setShowModal(false);
//     // router.push("/chat"); // Replace with your route
//   };

//   return (
//     <View style={styles.container}>
//       <LottieView
//         ref={animationRef}
//         source={require("@/assets/finding.json")}
//         style={styles.globe}
//         loop
//         autoPlay={false}
//       />

//       <TouchableOpacity
//         style={styles.button}
//         onPress={handleFindFriends}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator color="white" />
//         ) : (
//           <Text style={styles.buttonText}>Find Friends</Text>
//         )}
//       </TouchableOpacity>

//   {/* Friend Found Modal */}
//   <Modal visible={showModal} transparent animationType="fade">
//     <View style={styles.modalOverlay}>
//       <View style={styles.modalContent}>
//         <Text style={styles.modalTitle}>🎉 Friend Found!</Text>
//         <Text style={styles.modalMessage}>You can start chatting now.</Text>

//         <Pressable style={styles.modalButton} onPress={handleStartChat}>
//           <Text style={styles.modalButtonText}>Start Chat</Text>
//         </Pressable>
//         <Pressable onPress={() => setShowModal(false)}>
//           <Text style={styles.cancelText}>Maybe later</Text>
//         </Pressable>
//       </View>
//     </View>
//   </Modal>
//     </View>
//   );
// };

// export default WorldScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#0c0c0c",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingBottom: 60,
//   },
//   globe: {
//     width: 250,
//     height: 250,
//   },
//   button: {
//     marginTop: 40,
//     backgroundColor: "#2f80ed",
//     paddingHorizontal: 32,
//     paddingVertical: 14,
//     borderRadius: 30,
//   },
//   buttonText: {
//     color: "white",
//     fontWeight: "600",
//     fontSize: 16,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.7)",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   modalContent: {
//     backgroundColor: "#1a1a1a",
//     borderRadius: 20,
//     padding: 24,
//     width: 280,
//     alignItems: "center",
//     elevation: 10,
//   },
//   modalTitle: {
//     fontSize: 20,
//     color: "#fff",
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
//   modalMessage: {
//     color: "#ccc",
//     fontSize: 14,
//     textAlign: "center",
//     marginBottom: 20,
//   },
//   modalButton: {
//     backgroundColor: "#2f80ed",
//     paddingHorizontal: 24,
//     paddingVertical: 10,
//     borderRadius: 20,
//     marginBottom: 12,
//   },
//   modalButtonText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 15,
//   },
//   cancelText: {
//     color: "#888",
//     fontSize: 13,
//     textDecorationLine: "underline",
//   },
// });
// app/world.tsx

import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
} from "react-native";
import LottieView from "lottie-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  getDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import findOrCreateRandomChat from "@/hooks/useRandomChat";
import { useTheme } from "@/context/ThemeContext";

const WorldScreen = () => {
  const animationRef = useRef<LottieView>(null);
  const [loading, setLoading] = useState(false);
  const [randomChats, setRandomChats] = useState<any[]>([]);
  const router = useRouter();
  const { user } = useAuth();
  const { themeConfig } = useTheme();
  const BackgroundColor = themeConfig.background;
  const TextColor = themeConfig.text;
  const ListColor = themeConfig.tab;
  // console.log(user, "uer in world screen");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false);
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
  const handleFindFriends = async () => {
    setLoading(true);
    animationRef.current?.play();
    const chatId = await findOrCreateRandomChat(user?.uid as string);
    // Simulate finding friends
    setTimeout(() => {
      animationRef.current?.pause();
      setLoading(false);
      setShowModal(true);
      // router.push("/random-chat/foundChatId"); // navigate if needed
    }, 3000);
  };
  const handleStartChat = () => {
    setShowModal(false);
    // router.push("/chat"); // Replace with your route
  };
  // Load existing random chats
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "randomChats"),
      where("users", "array-contains", user.uid),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatsData = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const partnerId = data.users.find((uid: string) => uid !== user.uid);

          const userDoc = await getDoc(doc(db, "users", partnerId));
          const partnerName = userDoc.exists()
            ? userDoc.data().name
            : "Unknown";

          return {
            id: docSnap.id,
            partnerName,
            lastMessage: data.lastMessage,
            updatedAt: data.updatedAt?.toDate().toLocaleTimeString(),
          };
        })
      );

      setRandomChats(chatsData);
    });

    return unsubscribe;
  }, [user?.uid]);
  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteDoc(doc(db, "randomChats", chatId));
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const renderChat = ({ item }: any) => (
    <View>
      <View>
        <TouchableOpacity
          style={styles.chatItem}
          onPress={() => router.push(`/random-chat/${item.id}`)}
        >
          <Text style={styles.partnerName}>Random</Text>
          <Text style={styles.message}>{item.lastMessage}</Text>
          <Text style={styles.time}>{item.updatedAt}</Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => handleDeleteChat(item.id)}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteText}>Remove and Find Another friend</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: BackgroundColor }]}>
      {randomChats.length === 0 && (
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <LottieView
            ref={animationRef}
            source={require("@/assets/finding.json")}
            style={styles.globe}
            loop
            autoPlay={false}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleFindFriends}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Find Friends</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Friend Found Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎉 Friend Found!</Text>
            <Text style={styles.modalMessage}>You can start chatting now.</Text>

            <Pressable style={styles.modalButton} onPress={handleStartChat}>
              <Text style={styles.modalButtonText}>Start Chat</Text>
            </Pressable>
            <Pressable onPress={() => setShowModal(false)}>
              <Text style={styles.cancelText}>Maybe later</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      {isAdmin ? (
        <TouchableOpacity onPress={() => router.push("/admin/random-chats")}>
          <Text style={[styles.title, { color: TextColor }]}>
            Your Random Chats
          </Text>
        </TouchableOpacity>
      ) : (
        <Text style={[styles.title, { color: TextColor }]}>
          Your Random Chats
        </Text>
      )}

      <FlatList
        data={randomChats}
        renderItem={renderChat}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>No random chats yet. Find friends!</Text>
        }
        contentContainerStyle={{ paddingBottom: 100, width: "100%" }}
      />
    </View>
  );
};

export default WorldScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0c0c0c",
    // alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  globe: {
    width: 250,
    height: 250,
  },
  button: {
    backgroundColor: "#2f80ed",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  chatItem: {
    backgroundColor: "#1f1f1f",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignSelf: "stretch", // Ensures full width in container
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  partnerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2f80ed",
  },
  message: {
    color: "#ccc",
    marginTop: 4,
    maxWidth: 200,
  },
  time: {
    color: "#888",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 10,
  },
  empty: {
    color: "#666",
    marginTop: 20,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    padding: 24,
    width: 280,
    alignItems: "center",
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalMessage: {
    color: "#ccc",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#2f80ed",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 12,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  cancelText: {
    color: "#888",
    fontSize: 13,
    textDecorationLine: "underline",
  },
  deleteButton: {
    backgroundColor: "#ff4d4d",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  deleteText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
});
