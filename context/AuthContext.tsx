// // context/authContext.tsx
// import React, { createContext, useContext, useEffect, useState } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import {
//   createUserWithEmailAndPassword,
//   onAuthStateChanged,
//   sendEmailVerification,
//   signInAnonymously,
//   signInWithEmailAndPassword,
//   signOut,
//   updateProfile,
// } from "firebase/auth";
// import { auth, db } from "../firebaseConfig";
// import { router } from "expo-router";
// import { doc, setDoc } from "firebase/firestore";

// interface AuthContextProps {
//   user: string | null;
//   loginAsGuest: (name: string) => Promise<void>;
//   logout: () => Promise<void>;
//   loading: boolean;
//   signupWithEmail: (
//     email: string,
//     password: string,
//     username: string
//   ) => Promise<void>;
//   loginWithEmail: (email: string, password: string) => Promise<void>;
//   checkEmailVerified: () => Promise<boolean>;
// }

// const AuthContext = createContext<AuthContextProps>({
//   user: null,
//   loginAsGuest: async () => {},
//   logout: async () => {},
//   loading: true,
//   signupWithEmail: async () => {},
//   loginWithEmail: async () => {},
//   checkEmailVerified: async () => {
//     return false;
//   },
// });

// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [user, setUser] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
//       if (firebaseUser) {
//         const name = firebaseUser.displayName || firebaseUser.email || null;

//         // Only allow verified email users to continue
//         if (firebaseUser.email && !firebaseUser.emailVerified) {
//           // console.log("Email not verified yet");
//           setUser(null);
//           setLoading(false);
//           return;
//         }

//         await AsyncStorage.setItem("guestName", name || "");
//         setUser(name);
//       } else {
//         setUser(null);
//       }
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, []);

//   const loginAsGuest = async (name: string) => {
//     const credential = await signInAnonymously(auth);
//     await updateProfile(credential.user, { displayName: name });
//     await AsyncStorage.setItem("guestName", name);
//     setUser(name);
//   };
//   const signupWithEmail = async (email: any, password: any, username: any) => {
//     const result = await createUserWithEmailAndPassword(auth, email, password);
//     await sendEmailVerification(result.user);
//     await updateProfile(result.user, { displayName: username });
//     // Save the username in Firestore under 'name' field
//     await setDoc(doc(db, "users", result.user.uid), {
//       name: username,
//       email: email, // optional: you can include this if you want
//       createdAt: new Date(),
//     });
//     setUser(null); // Prevent login until verified

//     // Redirect to verify-email screen
//     router.replace("/verify-email");
//     // setUser(result.user);
//   };

//   const loginWithEmail = async (email: any, password: any) => {
//     const result = await signInWithEmailAndPassword(auth, email, password);
//     await AsyncStorage.setItem("guestName", email);

//     setUser(email);
//     const savedToken = await AsyncStorage.getItem("expoPushToken");
//     if (savedToken) {
//       await setDoc(
//         doc(db, "users", result.user.uid),
//         { expoPushToken: savedToken },
//         { merge: true }
//       );
//     }
//     // setUser(result.user);
//   };
//   const checkEmailVerified = async (): Promise<boolean> => {
//     await auth.currentUser?.reload(); // Refresh user from Firebase
//     const currentUser = auth.currentUser;

//     if (currentUser?.emailVerified) {
//       await AsyncStorage.setItem(
//         "guestName",
//         currentUser.email || "Verified User"
//       );
//       setUser(currentUser.email || "Verified User");
//       const savedToken = await AsyncStorage.getItem("expoPushToken");
//       if (savedToken) {
//         await setDoc(
//           doc(db, "users", currentUser?.uid),
//           { expoPushToken: savedToken },
//           { merge: true }
//         );
//       }
//       return true;
//     }
//     return false;
//   };

//   const logout = async () => {
//     await signOut(auth);
//     await AsyncStorage.removeItem("guestName");
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         loginAsGuest,
//         logout,
//         loading,
//         signupWithEmail,
//         loginWithEmail,
//         checkEmailVerified,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };
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
  User,
} from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { router } from "expo-router";
import { doc, setDoc } from "firebase/firestore";

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  loginAsGuest: (name: string) => Promise<void>;
  signupWithEmail: (
    email: string,
    password: string,
    username: string
  ) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkEmailVerified: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  loginAsGuest: async () => {},
  signupWithEmail: async () => {},
  loginWithEmail: async () => {},
  logout: async () => {},
  checkEmailVerified: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (firebaseUser.email && !firebaseUser.emailVerified) {
          setUser(null);
          setLoading(false);
          return;
        }

        await AsyncStorage.setItem(
          "guestName",
          firebaseUser.displayName || firebaseUser.email || ""
        );
        setUser(firebaseUser);
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
    setUser(credential.user);
  };

  const signupWithEmail = async (
    email: string,
    password: string,
    username: string
  ) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(result.user);
    await updateProfile(result.user, { displayName: username });

    await setDoc(doc(db, "users", result.user.uid), {
      name: username,
      email,
      createdAt: new Date(),
    });

    setUser(null); // Wait for email verification
    router.replace("/verify-email");
  };

  const loginWithEmail = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await AsyncStorage.setItem("guestName", email);
    setUser(result.user);

    const savedToken = await AsyncStorage.getItem("expoPushToken");
    if (savedToken) {
      await setDoc(
        doc(db, "users", result.user.uid),
        { expoPushToken: savedToken },
        { merge: true }
      );
    }
  };

  const checkEmailVerified = async (): Promise<boolean> => {
    await auth.currentUser?.reload();
    const currentUser = auth.currentUser;

    if (currentUser?.emailVerified) {
      await AsyncStorage.setItem(
        "guestName",
        currentUser.email || "Verified User"
      );
      setUser(currentUser);

      const savedToken = await AsyncStorage.getItem("expoPushToken");
      if (savedToken) {
        await setDoc(
          doc(db, "users", currentUser.uid),
          { expoPushToken: savedToken },
          { merge: true }
        );
      }

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
        loading,
        loginAsGuest,
        signupWithEmail,
        loginWithEmail,
        logout,
        checkEmailVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
