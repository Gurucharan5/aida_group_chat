import axios from "axios";

export const sendPushNotification = async (expoToken: string | null, title: string, body: string) => {
    if (!expoToken) return;
    const message = {
      to: expoToken,
      sound: "default",
      title: title,
      body: body,
      data: { someData: "goes here", groupName: title },
      androidChannelId: "group-chat", // Match the channel ID you’ll define on the client
      collapseKey: `group-${title}`,
      tag: `group-${title}`, // Ensures all messages from the same group stack
    };

    try {
      await axios.post("https://exp.host/--/api/v2/push/send", message, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      // console.log(message,"===============================")
      // console.log("Notification sent successfully!");
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };