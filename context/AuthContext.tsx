// context/authContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import { router } from "expo-router";

interface AuthContextProps {
  user: string | null;
  loginAsGuest: (name: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  signupWithEmail: (
    email: string,
    password: string,
    username: string
  ) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  checkEmailVerified: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loginAsGuest: async () => {},
  logout: async () => {},
  loading: true,
  signupWithEmail: async () => {},
  loginWithEmail: async () => {},
  checkEmailVerified: async () => {
    return false;
  },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const loadUser = async () => {
  //     const stored = await AsyncStorage.getItem("guestName");
  //     if (stored) {
  //       setUser(stored);
  //     }
  //     setLoading(false);
  //   };
  //   loadUser();
  // }, []);
  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, async (user) => {
  //     if (user) {
  //       console.log("coming if")
  //       // Session restored successfully
  //       await AsyncStorage.setItem("guestName", user.displayName || user.email || "");
  //       setUser(user.displayName || user.email || null);
  //     } else {
  //       console.log("coming else")
  //       // No user session
  //       setUser(null);
  //     }
  //     setLoading(false);
  //   });

  //   return () => unsubscribe(); // clean up
  // }, []);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const name = firebaseUser.displayName || firebaseUser.email || null;

        // Only allow verified email users to continue
        if (firebaseUser.email && !firebaseUser.emailVerified) {
          // console.log("Email not verified yet");
          setUser(null);
          setLoading(false);
          return;
        }

        await AsyncStorage.setItem("guestName", name || "");
        setUser(name);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginAsGuest = async (name: string) => {
    const credential = await signInAnonymously(auth);
    await updateProfile(credential.user, { displayName: name });
    await AsyncStorage.setItem("guestName", name);
    setUser(name);
  };
  const signupWithEmail = async (email: any, password: any, username: any) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(result.user);
    await updateProfile(result.user, { displayName: username });
    setUser(null); // Prevent login until verified

    // Redirect to verify-email screen
    router.replace("/verify-email");
    // setUser(result.user);
  };

  const loginWithEmail = async (email: any, password: any) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await AsyncStorage.setItem("guestName", email);
    console.log("User logged in:", result.user);
    console.log(result.user.displayName, "-------------------");
    const displayName = result.user.displayName || email;
    await updateProfile(result.user, { displayName: displayName });
    // console.log("User logged in:", result.user);
    setUser(email);
    // setUser(result.user);
  };
  const checkEmailVerified = async (): Promise<boolean> => {
    await auth.currentUser?.reload(); // Refresh user from Firebase
    const currentUser = auth.currentUser;

    if (currentUser?.emailVerified) {
      await AsyncStorage.setItem(
        "guestName",
        currentUser.email || "Verified User"
      );
      setUser(currentUser.email || "Verified User");
      return true;
    }
    return false;
  };

  const logout = async () => {
    await signOut(auth);
    await AsyncStorage.removeItem("guestName");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loginAsGuest,
        logout,
        loading,
        signupWithEmail,
        loginWithEmail,
        checkEmailVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
