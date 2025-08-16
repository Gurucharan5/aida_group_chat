import * as ImagePicker from "expo-image-picker";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dbgscccun/video/upload";
const UPLOAD_PRESET = "aida_upload";

export const pickAndUploadVideo = async (onProgress?: (progress: number) => void) => {
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

  return new Promise<string | null>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        let progress = Math.round((event.loaded / event.total) * 100);
        progress = Math.min(progress, 100); // clamp max 100
        onProgress?.(progress);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.response);
        resolve(response.secure_url);
      } else {
        console.error("Upload failed:", xhr.response);
        reject(null);
      }
    };

    xhr.onerror = () => {
      console.error("Upload error");
      reject(null);
    };

    xhr.open("POST", CLOUDINARY_URL);
    xhr.send(formData);
  });

  // try {
  //   const response = await fetch(CLOUDINARY_URL, {
  //     method: "POST",
  //     body: formData,
  //   });

  //   const data = await response.json();
  //   return data.secure_url;
  // } catch (error) {
  //   console.error("Video upload failed:", error);
  //   return null;
  // }
};
