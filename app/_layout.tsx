// app/_layout.tsx
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { Slot } from "expo-router";
import * as Notifications from "expo-notifications";
import { ThemeProvider } from "@/context/ThemeContext";
import { useEffect, useState } from "react";
import CustomToast from "@/components/CustomToast";
import { ToastProvider } from "@/context/ToastContext";
import { View, StyleSheet, Image } from "react-native";
import LottieView from "lottie-react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: false,
    shouldShowList: false,
  }),
});

export default function Layout() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState(""); // To store the toast message
  const [toastTitle, setToastTitle] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Simulate startup check (replace with your auth check)
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1500); // wait 1.5s for loading animation
    return () => clearTimeout(timer);
  }, []);

  // if (initialLoading) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <LottieView
  //         source={require("@/assets/loading.json")}
  //         autoPlay
  //         loop
  //         style={{ width: 200, height: 200 }}
  //       />
  //     </View>
  //   );
  // }

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        const { title, body, data } = notification.request.content;

        // Set toast message and title

        setToastTitle(title ?? "New Message");
        // setToastMessage(body ?? "check");
        setToastMessage(`${title ?? "Notification"} - ${body ?? "Check"}`);

        // Show toast for 3 seconds
        setShowToast(true);

        // Hide the toast after 3 seconds
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
        // console.log(title, "----titie", body, "-----------------");
      }
    );

    return () => subscription.remove();
  }, []);
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <ToastProvider>
            {initialLoading ? (
              <View style={styles.loadingContainer}>
                {/* App Logo */}
                <Image
                  source={require("@/assets/images/Aii.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <LottieView
                  source={require("@/assets/loading.json")}
                  autoPlay
                  loop
                  style={{ width: 200, height: 200 }}
                />
              </View>
            ) : (
              <Slot />
            )}
            {showToast && (
              <CustomToast
                message={toastMessage}
                duration={30000}
                onHide={() => setShowToast(false)}
              />
            )}
          </ToastProvider>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#141514",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 200,
    height: 200,
  },
});
