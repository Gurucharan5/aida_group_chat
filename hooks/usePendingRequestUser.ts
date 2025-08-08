import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useEffect, useState } from "react";

export const usePendingRequestsWithUserData = (groupId: string) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);
  useEffect(() => {
    if (!groupId) return;

    const q = query(
      collection(db, "groups", groupId, "groupRequests"),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      setLoading(true);

      const requestsWithUserData = await Promise.all(
        querySnapshot.docs.map(async (docSnap) => {
          const requestData = docSnap.data();
          const userId = requestData.id;

          try {
            const userDoc = await getDoc(doc(db, "users", userId));
            const userData = userDoc.exists() ? userDoc.data() : {};

            return {
              ...requestData,
              uid: userId,
              user: {
                id: userId,
                ...userData,
              },
            };
          } catch (error) {
            console.error("Error fetching user data:", error);
            return {
              ...requestData,
              uid: userId,
              user: null,
            };
          }
        })
      );

      const unsubscribeMembers = onSnapshot(
        collection(db, "groups", groupId, "members"),
        (snapshot) => {
          setMembers(snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() })));
        }
      );

      setRequests(requestsWithUserData);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    } // Cleanup on unmount
  }, [groupId]);

  return { requests, loading };
};
