// // app/login.tsx
// import React, { useState, useEffect } from "react";
// import { View, Text, Button, TextInput, StyleSheet, Alert } from "react-native";
// import { useRootNavigationState, useRouter } from "expo-router";
// import { useAuth } from "@/context/AuthContext";
// import { ScrollView } from "react-native";

// const LoginScreen: React.FC = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [username, setUsername] = useState("");
//   const [isSignupMode, setIsSignupMode] = useState(false);
//   const [isGuestLogin, setIsGuestLogin] = useState(false);
//   const [name, setName] = useState("");
//   const [showDisclaimer, setShowDisclaimer] = useState(false);

//   const { loginAsGuest, user, loading, signupWithEmail, loginWithEmail } =
//     useAuth();
//   const router = useRouter();
//   const navigationState = useRootNavigationState();
//   // only run redirect if root layout is ready
//   useEffect(() => {
//     if (!loading && user && navigationState?.key) {
//       router.replace("/(tabs)");
//     }
//   }, [user, loading, navigationState]);
//   const handleLogin = async () => {
//     if (!name.trim()) return Alert.alert("Please enter your name");
//     setShowDisclaimer(true);
//   };
//   const confirmDisclaimer = async () => {
//     try {
//       await loginAsGuest(name.trim());
//     } catch (err) {
//       Alert.alert("Login error", (err as Error).message);
//     }
//   };
//   const handleEmailSignup = async () => {
//     if (!email.trim() || !password.trim() || !username.trim()) {
//       return Alert.alert("Please fill in all fields");
//     }

//     try {
//       await signupWithEmail(email, password,username);
//     } catch (err) {
//       Alert.alert("Signup error", (err as Error).message);
//     }
//   };

//   const handleEmailLogin = async () => {
//     if (!email.trim() || !password.trim()) {
//       return Alert.alert("Please enter email and password");
//     }
//     try {
//       await loginWithEmail(email, password);
//     } catch (err) {
//       Alert.alert("Login error", (err as Error).message);
//     }
//   };
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>
//         {isGuestLogin ? "Guest Login" : isSignupMode ? "Email Sign Up" : "Email Login"}
//       </Text>

//       {isGuestLogin ? (
//         <View>
//           <TextInput
//             value={name}
//             onChangeText={setName}
//             placeholder="Your name"
//             style={styles.input}
//           />
//           <Button title="Continue as Guest" onPress={handleLogin} />
//         </View>
//       ) : (
//         <>
//           {isSignupMode && (
//             <TextInput
//               value={username}
//               onChangeText={setUsername}
//               placeholder="Username"
//               style={styles.input}
//             />
//           )}
//           <TextInput
//             value={email}
//             onChangeText={setEmail}
//             placeholder="Email"
//             style={styles.input}
//           />
//           <TextInput
//             value={password}
//             onChangeText={setPassword}
//             placeholder="Password"
//             style={styles.input}
//             secureTextEntry
//           />
//           {isSignupMode ? (
//             <Button title="Sign Up" onPress={handleEmailSignup} />
//           ) : (
//             <Button title="Login" onPress={handleEmailLogin} />
//           )}
//           <Text
//             style={styles.switchLink}
//             onPress={() => setIsSignupMode(!isSignupMode)}
//           >
//             {isSignupMode ? "Switch to Login" : "Don't have an account? Sign Up"}
//           </Text>
//         </>
//       )}
//       {/* <Text
//         style={styles.switchLink}
//         onPress={() => {
//           setIsGuestLogin(!isGuestLogin)
//           setIsSignupMode(false);
//         }}
//       >
//         {isGuestLogin ? "Switch to Email Login" : "Switch to Guest Login"}
//       </Text> */}
//       {showDisclaimer && (
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <ScrollView>
//               <Text style={styles.modalTitle}>Disclaimer</Text>
//               <Text style={styles.modalText}>
//                 By continuing, you confirm that you are 18 years or older and
//                 agree to follow our Community Guidelines.
//               </Text>
//               <Text
//                 style={styles.linkText}
//                 onPress={() => router.push("/GuideLines")}
//               >
//                 View Community Guidelines
//               </Text>

//               <Button title="Agree and Continue" onPress={confirmDisclaimer} />
//               <View style={{ height: 10 }} />
//               <Button
//                 title="Cancel"
//                 onPress={() => setShowDisclaimer(false)}
//                 color="gray"
//               />
//             </ScrollView>
//           </View>
//         </View>
//       )}
//     </View>
//   );
// };

// export default LoginScreen;

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: "center", padding: 20 },
//   title: { fontSize: 22, marginBottom: 12, textAlign: "center" },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 6,
//     padding: 10,
//     marginBottom: 16,
//   },
//   modalOverlay: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContent: {
//     backgroundColor: "#fff",
//     padding: 20,
//     borderRadius: 10,
//     width: "90%",
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
//   modalText: {
//     fontSize: 16,
//     marginBottom: 20,
//     textAlign: "center",
//   },
//   linkText: {
//     color: "blue",
//     textAlign: "center",
//     marginVertical: 10,
//     textDecorationLine: "underline",
//   },
//   switchLink: { textAlign: "center", color: "blue", marginTop: 10 },
// });
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [isGuestLogin, setIsGuestLogin] = useState(false);
  const [name, setName] = useState("");
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const { loginAsGuest, user, loading, signupWithEmail, loginWithEmail } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/(tabs)");
    }
  }, [user, loading]);

  const handleLogin = async () => {
    if (!name.trim()) return Alert.alert("Please enter your name");
    setShowDisclaimer(true);
  };

  const confirmDisclaimer = async () => {
    try {
      await loginAsGuest(name.trim());
    } catch (err) {
      Alert.alert("Login error", (err as Error).message);
    }
  };

  const handleEmailSignup = async () => {
    if (!email.trim() || !password.trim() || !username.trim()) {
      return Alert.alert("Please fill in all fields");
    }
    try {
      await signupWithEmail(email, password, username);
    } catch (err) {
      Alert.alert("Signup error", (err as Error).message);
    }
  };

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      return Alert.alert("Please enter email and password");
    }
    try {
      await loginWithEmail(email, password);
    } catch (err) {
      Alert.alert("Login error", (err as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isGuestLogin ? "Guest Login" : isSignupMode ? "Email Sign Up" : "Email Login"}
      </Text>

      {isGuestLogin ? (
        <View>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            style={styles.input}
          />
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {isSignupMode && (
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              style={styles.input}
            />
          )}
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            style={styles.input}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            style={styles.input}
            secureTextEntry
          />
          {isSignupMode ? (
            <TouchableOpacity style={styles.button} onPress={handleEmailSignup}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleEmailLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setIsSignupMode(!isSignupMode)}>
            <Text style={styles.switchLink}>
              {isSignupMode ? "Switch to Login" : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </>
      )}

      {showDisclaimer && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Disclaimer</Text>
              <Text style={styles.modalText}>
                By continuing, you confirm that you are 18 years or older and agree to follow our Community Guidelines.
              </Text>
              <TouchableOpacity onPress={() => router.push("/GuideLines")}>
                <Text style={styles.linkText}>View Community Guidelines</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={confirmDisclaimer}>
                <Text style={styles.buttonText}>Agree and Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowDisclaimer(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#F5F5F5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#FFF",
  },
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  switchLink: {
    textAlign: "center",
    color: "#007BFF",
    fontSize: 14,
    marginTop: 10,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 12,
    width: "85%",
    maxWidth: 400,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  modalText: { fontSize: 16, marginBottom: 20, textAlign: "center", color: "#333" },
  linkText: { color: "#007BFF", textAlign: "center", marginBottom: 20, textDecorationLine: "underline" },
  cancelButton: { backgroundColor: "#777", marginTop: 10 },
});
