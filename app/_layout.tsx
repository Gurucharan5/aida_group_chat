// app/_layout.tsx
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { Slot } from "expo-router";
import * as Notifications from "expo-notifications";
import { ThemeProvider } from "@/context/ThemeContext";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});
export default function Layout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <Slot />
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
