import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
// import { auth, db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";

const CheckingChatroom = () => {
  const router = useRouter();
  const { id: groupId, name: groupName } = useLocalSearchParams();
  const currentUserId = auth.currentUser?.uid;
  const [hasPassedCheckingChatroom, setHasPassedCheckingChatroom] = useState(false);


  const [status, setStatus] = useState<"loading" | "allowed" | "blocked" | "request" | "notMember">("loading");

  useEffect(() => {
    const checkAccess = async () => {
      if (!currentUserId || !groupId) return;

      const groupRef = doc(db, "groups", groupId as string);
      const memberRef = doc(db, `groups/${groupId}/members`, currentUserId);

      const [groupSnap, memberSnap] = await Promise.all([getDoc(groupRef), getDoc(memberRef)]);

      if (!groupSnap.exists()) {
        setStatus("blocked");
        return;
      }

    //   useEffect(() => {
    //     // if (hasPassedCheckingChatroom) {
    //     //   // If the user has passed the checking screen, don't navigate back to it
    //     //   router.push("/chatroom"); // Make sure to go to chatroom directly
    //     // } else {
    //     //   // If the user hasn't passed, go to CheckingChatroom
    //     //   router.push("/checkingchatroom");
    //     // }
    //   }, [hasPassedCheckingChatroom]);

      const group = groupSnap.data();
      const isBlocked = group.blockedUsers?.some(
        (user: { userId: string }) => user.userId === currentUserId
      );
      const isAdmin = group.createdBy === currentUserId;

      if (isBlocked) {
        setStatus("blocked");
      } else if (memberSnap.exists() || isAdmin) {
        setStatus("allowed");
      } else if (group.isPublic) {
        setStatus("notMember");
      } else {
        setStatus("request");
      }
    };

    checkAccess();
  }, [groupId]);
  useEffect(() => {
    if (status === "allowed") {
      goToChatroom(); // ✅ safe navigation here
    }
  }, [status]);
  const handleJoin = () => {
    // You can put your actual join logic here
    console.log("Joining group...");
    // Example:
    // joinPublicGroup(groupId);
  };

  const handleRequest = () => {
    // You can put your actual request logic here
    console.log("Requesting to join private group...");
    // Example:
    // requestToJoinPrivateGroup(groupId);
  };

  const handleCancel = () => {
    router.back();
  };

  const goToChatroom = () => {
    setHasPassedCheckingChatroom(true);
    router.push({
      pathname: "/chatroom",
      params: {
        id: groupId as string,
        name: groupName as string,
      },
    });
  };

  if (status === "loading") {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
        <Text>Checking access...</Text>
      </View>
    );
  }

//   if (status === "allowed") {
//     goToChatroom();
//     return null;
//   }

  if (status === "blocked") {
    return (
      <View className="flex-1 justify-center items-center px-4">
        <Text className="text-xl font-semibold text-red-500 mb-2">Access Denied</Text>
        <Text className="text-center text-gray-600">You have been blocked from this group.</Text>
        <TouchableOpacity onPress={handleCancel} className="mt-4 bg-gray-400 px-6 py-2 rounded-xl">
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center px-4">
      <Text className="text-xl font-semibold mb-2">Join Group?</Text>
      <Text className="text-center text-gray-700 mb-6">
        Do you want to join <Text className="font-bold">{groupName}</Text>?
      </Text>

      {status === "notMember" && (
        <TouchableOpacity onPress={handleJoin} className="bg-blue-600 px-6 py-2 rounded-xl mb-3">
          <Text className="text-white">Join Group</Text>
        </TouchableOpacity>
      )}

      {status === "request" && (
        <TouchableOpacity onPress={handleRequest} className="bg-yellow-600 px-6 py-2 rounded-xl mb-3">
          <Text className="text-white">Send Join Request</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={handleCancel} className="bg-gray-500 px-6 py-2 rounded-xl">
        <Text className="text-white">Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CheckingChatroom;
