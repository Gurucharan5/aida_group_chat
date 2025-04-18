import * as ImagePicker from 'expo-image-picker';

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dhhqviw8d/image/upload";
const UPLOAD_PRESET = "aida_upload";

export const pickAndUploadImage = async (): Promise<string | null> => {
  try {
    // Ask for permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access media library is required!");
      return null;
    }

    // Pick an image
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (pickerResult.canceled || !pickerResult.assets || pickerResult.assets.length === 0) {
      return null;
    }

    const image = pickerResult.assets[0];

    // Prepare form data
    const formData = new FormData();
    formData.append("file", {
      uri: image.uri,
      type: "image/jpeg",
      name: "upload.jpg",
    } as any);
    formData.append("upload_preset", UPLOAD_PRESET);
    console.log(formData,"------------------")
    // Upload to Cloudinary
    const response = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    console.log(data,"=========================")
    return data.secure_url; // ✅ URL of the uploaded image
  } catch (error) {
    console.error("Upload error:", error);
    return null;
  }
};
