// import { View, Text, Button } from 'react-native'
// import React, { useEffect } from 'react'
// import { useRouter } from 'expo-router';
// import { useAuth } from '@/context/AuthContext';

// const explore = () => {

//   // inside component
// const { user, logout } = useAuth();
// const router = useRouter();

// useEffect(() => {
//   if (!user) {
//     router.replace('/login');
//   }
// }, [user]);

//   return (
//     <View>
//       <Text>explore</Text>
//       <Button title="Logout" onPress={logout} />
//     </View>
//   )
// }

// export default explore
import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import PushNotification from "../PushNotification";
import { useTheme } from "@/context/ThemeContext";
import { StatusBar } from "expo-status-bar";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";
import { getAuth, updateProfile } from "firebase/auth";
import { ThemeSelector } from "@/components/ThemeSelector";

const Explore = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { themeConfig } = useTheme();
  const BackgroundColor = themeConfig.background;
  const TextColor = themeConfig.text;
  const ListColor = themeConfig.tab;
  const [username, setUsername] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  // Fetch the username when the component mounts
  useEffect(() => {
    const fetchUsername = async () => {
      const user = auth?.currentUser;
      if (!user) return;

      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUsername(userDoc.data()?.name || "");
        }
      }
    };
    fetchUsername();
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
    setNewName(username);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Update Firebase Auth displayName
      const user = auth?.currentUser;
      if (!user) return;
      await updateProfile(user, { displayName: newName });

      // Update Firestore with new username
      const userDocRef = doc(db, "users", user?.uid);
      await updateDoc(userDocRef, {
        name: newName,
      });

      setUsername(newName);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating username:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewName(username); // Reset to original username if cancelled
  };
  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: BackgroundColor }]}
      contentContainerStyle={{
        justifyContent: "flex-start",
        paddingTop: 50,
        paddingBottom: 50,
      }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style="light" />
      <Text style={[styles.heading, { color: TextColor, marginBottom: 10 }]}>
        Settings
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Disclaimer</Text>
        <Text style={styles.disclaimerText}>
          This app is intended for users aged 18 and above. Any misuse, abusive
          content, or violations of our community guidelines may result in
          removal or bans. The admin reserves full rights to manage user content
          and activity. By using this app, you agree to our Terms and Policies.
        </Text>
      </View>
      <View style={[styles.cardContainer, { marginTop: 10 }]}>
        <View style={[styles.card, { backgroundColor: BackgroundColor }]}>
          <Text style={[styles.cardTitle, { color: TextColor }]}>Username</Text>
          {!isEditing ? (
            <>
              <Text style={[styles.cardSubtitle, { color: TextColor }]}>
                {username || "No username set"}
              </Text>
              <TouchableOpacity onPress={handleEdit}>
                <Text style={styles.editButton}>Edit</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput
                style={[styles.input, { color: TextColor }]}
                value={newName}
                onChangeText={setNewName}
                placeholderTextColor={TextColor}
              />
              <View style={styles.buttonsContainer}>
                <Button title="Save" onPress={handleSave} disabled={loading} />
                <Button title="Cancel" onPress={handleCancel} />
              </View>
            </>
          )}
        </View>
      </View>
      <ThemeSelector />
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Explore;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    // justifyContent: "flex-start",
  },
  heading: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 20,
    color: "#111827",
  },
  subheading: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 30,
  },
  cardContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  logoutButton: {
    marginTop: "auto",
    backgroundColor: "#EF4444",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  section: {
    padding: 15,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#111827",
  },
  disclaimerText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 22,
  },
  editButton: {
    color: "#4CAF50",
    fontSize: 16,
    marginTop: 8,
    textDecorationLine: "underline",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    marginBottom: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 10,
  },
});
