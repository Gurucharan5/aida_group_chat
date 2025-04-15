import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useNotification } from "@/context/NotificationContext";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";

const PushNotification = () => {
  const { notification, expoPushToken, error } = useNotification();
  const expoToken = "ExponentPushToken[K3QwRmEnK8xXA9c3KeC8bf]";
  // poco token  - ExponentPushToken[GtvjDsC7TUQ_fQ1B0SV0EI]
  // redmi token - ExponentPushToken[K3QwRmEnK8xXA9c3KeC8bf]
  const expoToken1 = "ExponentPushToken[YDRCCpF-j2KavhUTBwWexS]";
  const expoChecktoken = "ExponentPushToken[PGqFY8Ohxo7e9IQ_Nka-WH]";
  const officetoken = "ExponentPushToken[c6aK80I05toEFbD6ZgPWeq]"
  const charantoken = "ExponentPushToken[HvnOZpGQPnFpNboJSdHYSy]"
  const sendPushNotification = async (expoToken: string | null) => {
    if (!expoToken) return;
    const message = {
      to: officetoken,
      sound: "default",
      title: "New Message",
      body: "Hello from another device!",
      data: { someData: "goes here" },
    };

    try {
      await axios.post("https://exp.host/--/api/v2/push/send", message, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      console.log("Notification sent successfully!");
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const sendNotification = () => {
    console.log("coming inside send notification");
    sendPushNotification(expoToken);
  };
  if (error) {
    return <Text>Error: {error.message}</Text>;
  }
  console.log(JSON.stringify(notification, null, 2));
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <Text>PushNotification</Text>
        <Text>Notification: {JSON.stringify(notification, null, 2)}</Text>
        <Text>Expo Push Token: {expoPushToken}</Text>
        <Text>Error: {error}</Text>
        <Text>Latest Notification</Text>
        <Text>{notification?.request.content.title}</Text>
        <TouchableOpacity
          onPress={sendNotification}
          style={{ backgroundColor: "blue", padding: 10, borderRadius: 10 }}
        >
          <Text style={{ color: "white" }}>Send Notification</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

export default PushNotification;
