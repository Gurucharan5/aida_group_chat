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
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) return;

    setLoading(true);

    // Listener for pending requests
    const requestsQuery = query(
      collection(db, "groups", groupId, "groupRequests"),
      where("status", "==", "pending")
    );

    const unsubscribeRequests = onSnapshot(requestsQuery, async (querySnapshot) => {
      const requestsWithUserData = await Promise.all(
        querySnapshot.docs.map(async (docSnap) => {
          const requestData = docSnap.data();
          console.log(requestData, "requestDataddddddddddddddddddd from hook");
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

      setRequests(requestsWithUserData);
      setLoading(false);
    });

    // Listen to main group document to get members array
    const groupDocRef = doc(db, "groups", groupId);
    const unsubscribeGroup = onSnapshot(groupDocRef, async (groupSnap) => {
      const groupData = groupSnap.data();
      const memberIds = groupData?.members || [];

      const mems = await Promise.all(
        memberIds.map(async (userId: string) => {
          const userDoc = await getDoc(doc(db, "users", userId));
          const userData = userDoc.exists() ? userDoc.data() : {};

          return {
            uid: userId,
            user: {
              id: userId,
              ...userData,
            },
          };
        })
      );

      setMembers(mems);
    });

    return () => {
      unsubscribeRequests();
      unsubscribeGroup();
    };
  }, [groupId]);

  return { requests, members, loading };
};
