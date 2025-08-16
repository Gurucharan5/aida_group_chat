import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { sendPushNotification } from "@/helpers/SendNotification";
import { useTheme } from "@/context/ThemeContext";

const CreateGroup = () => {
  const router = useRouter();
  const { user } = useAuth();

  const [groupName, setGroupName] = useState("");
  const [groupType, setGroupType] = useState<"public" | "private">("private");
  const [maxMembers, setMaxMembers] = useState("10");
  const [buttonLoading, setButtonLoading] = useState(false);
  // Optional: App name for the group
  const [appName, setAppName] = useState("");
  const { themeConfig } = useTheme();
  const BackgroundColor = themeConfig.background;
  const TextColor = themeConfig.text;
  const ListColor = themeConfig.tab;
  const IconColor = themeConfig.icon;

  const handleCreateGroup = async () => {
    setButtonLoading(true);
    if (!groupName.trim()) {
      Alert.alert("Group name is required");
      setButtonLoading(false);
      return;
    }

    if (!Number(maxMembers) || parseInt(maxMembers) <= 0) {
      Alert.alert("Please enter a valid max members limit");
      setButtonLoading(false);
      return;
    }

    try {
      // Generate a unique ID first
      const groupDocRef = doc(collection(db, "groups"));
      const docRef = await addDoc(collection(db, "groups"), {
        uniqueId: groupDocRef.id,
        name: groupName.trim(),
        type: groupType,
        createdAt: serverTimestamp(),
        createdBy: user?.uid,
        members: [user?.uid],
        maxMembers: parseInt(maxMembers),
        appName: appName.trim() || null,
        lastMessage: {
          text: "",
          timestamp: serverTimestamp(),
        },
      });
      // ✅ Send notification to admin(s)
      const adminIds = ["lGVFHXM3YlRehqPKFjU63Ln8aFl1"]; // Your admin UID(s)
      for (const adminId of adminIds) {
        const adminDoc = await getDoc(doc(db, "users", adminId));
        if (adminDoc.exists()) {
          const token = adminDoc.data().expoPushToken;
          if (token) {
            await sendPushNotification(
              token,
              "New Group Created",
              `${user?.displayName || "A user"} created: ${groupName.trim()}`
            );
          }
        }
      }
      setButtonLoading(false);
      router.replace(`/chat/${docRef.id}`);
    } catch (error) {
      console.error("Error creating group:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: BackgroundColor }]}>
      <Text style={[styles.heading, { color: TextColor }]}>
        Create New Group
      </Text>

      <TextInput
        placeholder="Group Name"
        value={groupName}
        onChangeText={setGroupName}
        style={[styles.input, { color: TextColor }]}
        placeholderTextColor="#888"
        maxLength={15}
      />

      <View style={styles.switchRow}>
        <Text style={[styles.label, { color: TextColor }]}>Private Group?</Text>
        <Switch
          value={groupType === "private"}
          onValueChange={(val) => setGroupType(val ? "private" : "public")}
        />
      </View>

      <TextInput
        placeholder="Max Members"
        value={maxMembers}
        onChangeText={setMaxMembers}
        style={[styles.input, { color: TextColor }]}
        keyboardType="numeric"
        placeholderTextColor={"#888"}
      />

      <TextInput
        placeholder="App Name (optional)"
        value={appName}
        onChangeText={setAppName}
        style={[styles.input, { color: TextColor }]}
        placeholderTextColor={"#888"}
      />

      {buttonLoading ? (
        <View style={styles.button}>
          <Text style={styles.buttonText}>Creating.....</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleCreateGroup}>
          <Text style={styles.buttonText}>Create Group</Text>
        </TouchableOpacity>
      )}

      {/* <TouchableOpacity style={styles.button} onPress={handleCreateGroup}>
        <Text style={styles.buttonText}>Create Group</Text>
      </TouchableOpacity> */}
    </View>
  );
};

export default CreateGroup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
  },
  button: {
    backgroundColor: "#4a90e2",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
