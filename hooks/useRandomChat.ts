import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";

const findOrCreateRandomChat = async (currentUserId: string) => {
  const adminId = "lGVFHXM3YlRehqPKFjU63Ln8aFl1";

  const q = query(
    collection(db, "randomChats"),
    where("users", "array-contains", currentUserId)
  );

  const snapshot = await getDocs(q);

  // Check if chat already exists between current user and admin
  const existingChat = snapshot.docs.find((doc) => {
    const users = doc.data().users || [];
    return users.includes(adminId);
  });

  if (existingChat) {
    return existingChat.id; // Return existing chat ID
  }

  // If not found, create new
  const newChat = await addDoc(collection(db, "randomChats"), {
    users: [currentUserId, adminId],
    updatedAt: serverTimestamp(),
  });

  return newChat.id;
};
export default findOrCreateRandomChat;