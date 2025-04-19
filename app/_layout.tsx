// app/_layout.tsx
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { Slot } from "expo-router";
import * as Notifications from "expo-notifications";
import { ThemeProvider } from "@/context/ThemeContext";
import { useEffect, useState } from "react";
import CustomToast from "@/components/CustomToast";
import { ToastProvider } from "@/context/ToastContext";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function Layout() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState(""); // To store the toast message
  const [toastTitle, setToastTitle] = useState("");

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
            <Slot />
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
