import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { getAuth } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("group-chat", {
      name: "Group Chat",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      throw new Error(
        "Permission not granted to get push token for push notification!"
      );
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      throw new Error("Project ID not found");
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      // console.log(pushTokenString);
      await AsyncStorage.setItem("expoPushToken", pushTokenString);
      // ✅ Store it in Firestore under the current user
      const auth = getAuth();
      const user = auth.currentUser;
      // console.log("User ID: ", user?.uid);
      if (user?.uid) {
        const db = getFirestore();
        await setDoc(
          doc(db, "users", user.uid),
          { expoPushToken: pushTokenString },
          { merge: true } // this will keep existing data and only update token
        );
        // console.log("Push token stored in Firestore");
      }
      return pushTokenString;
    } catch (e: unknown) {
      throw new Error(`${e}`);
    }
  } else {
    throw new Error("Must use physical device for push notifications");
  }
}
