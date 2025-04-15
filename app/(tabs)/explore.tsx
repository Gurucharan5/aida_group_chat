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
import { View, Text, Button, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import PushNotification from "../PushNotification";

const Explore = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Settings</Text>
      

      <View style={styles.cardContainer}>
        

        
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Disclaimer</Text>
        <Text style={styles.disclaimerText}>
          This app is intended for users aged 18 and above. Any misuse, abusive content, or violations
          of our community guidelines may result in removal or bans. The admin reserves full rights
          to manage user content and activity. By using this app, you agree to our Terms and Policies.
        </Text>
      </View>
      

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Explore;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 20,
    justifyContent: "flex-start",
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
});
