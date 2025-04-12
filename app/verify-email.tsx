// app/verify-email.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { auth } from "../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";

const VerifyEmailScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [checking, setChecking] = useState(false);
  const { checkEmailVerified } = useAuth();
  const checkEmailVerifieds = async () => {
    setChecking(true);
    // const user = auth.currentUser;

    // await user?.reload();

    // if (user?.emailVerified) {
    //   await AsyncStorage.setItem('guestName', user.email || '');

    //   setChecking(false);
    //   router.replace('/(tabs)'); // Redirect to home
    // } else {
    //   setChecking(false);
    //   Alert.alert("Not Verified", "Please check your email and click the verification link.");
    // }
    const verified = await checkEmailVerified();
    if (verified) {
      router.replace("/(tabs)"); // Redirect to home
    } else {
      Alert.alert(
        "Email not verified",
        "Please verify your email before continuing."
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.message}>
        We’ve sent a verification link to your email. Please check your inbox
        (and spam folder).
      </Text>

      <Button
        title="I Verified My Email"
        onPress={checkEmailVerifieds}
        disabled={checking}
      />

      {checking && <ActivityIndicator size="small" style={{ marginTop: 10 }} />}
    </View>
  );
};

export default VerifyEmailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  message: { fontSize: 16, marginBottom: 20 },
});
