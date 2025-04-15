import axios from "axios";

export const sendPushNotification = async (expoToken: string | null, title: string, body: string) => {
    if (!expoToken) return;
    const message = {
      to: expoToken,
      sound: "default",
      title: `Message from ${title}`,
      body: body,
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