import * as ImagePicker from "expo-image-picker";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dhhqviw8d/video/upload";
const UPLOAD_PRESET = "aida_upload";

export const pickAndUploadVideo = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['videos'],
    allowsEditing: true,
    quality: 1,
  });

  if (!result.assets || result.canceled) return null;

  const video = result.assets[0];

  // Check if video size is under 15MB
  if (video.fileSize && video.fileSize > 15 * 1024 * 1024) {
    alert("Video must be under 15MB");
    return null;
  }

  const formData = new FormData();
  formData.append("file", {
    uri: video.uri,
    name: "upload.mp4",
    type: "video/mp4",
  } as any);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const response = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Video upload failed:", error);
    return null;
  }
};
