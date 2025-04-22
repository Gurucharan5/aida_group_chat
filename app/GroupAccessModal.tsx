import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { auth, db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

interface Props {
  visible: boolean;
  groupId: string;
  groupName: string;
  onJoin: () => void;
  onCancel: () => void;
  onAllowed: () => void;
  onSendRequest: () => void;
}

const GroupAccessModal: React.FC<Props> = ({
  visible,
  groupId,
  groupName,
  onJoin,
  onCancel,
  onAllowed,
  onSendRequest,
}) => {
  const [status, setStatus] = useState<
    | "checking"
    | "allowed"
    | "blocked"
    | "not-member"
    | "request-pending"
    | "join-group"
  >("checking");

  useEffect(() => {
    if (!visible) return;

    const checkAccess = async () => {
      setStatus("checking");
      const currentUserId = auth.currentUser?.uid;
      if (!currentUserId || !groupId) {
        setStatus("blocked");
        return;
      }

      try {
        const groupRef = doc(db, "groups", groupId);
        const memberDocRef = doc(
          db,
          `groups/${groupId}/members`,
          currentUserId
        );
        const reqDocRef = doc(
          db,
          "groups",
          groupId,
          "joinRequests",
          currentUserId
        );
        const [groupSnap, memberSnap, reqsnap] = await Promise.all([
          getDoc(groupRef),
          getDoc(memberDocRef),
          getDoc(reqDocRef),
        ]);

        if (!groupSnap.exists()) {
          setStatus("blocked");
          return;
        }

        const groupData = groupSnap.data();
        const isAdmin = groupData.createdBy === currentUserId;
        const AppAdmin = "lGVFHXM3YlRehqPKFjU63Ln8aFl1";
        const isBlocked = groupData.blockedUsers?.some(
          (user: { userId: string }) => user.userId === currentUserId
        );
        const isMember = memberSnap.exists();
        const isRequested = reqsnap.exists();
        if (isBlocked) setStatus("blocked");
        else if (isAdmin || isMember || AppAdmin) {
          setStatus("allowed");
          onAllowed();
        } else if (groupData.isPublic && !isMember && !isAdmin)
          setStatus("not-member");
        else if (isRequested) setStatus("request-pending");
        else setStatus("join-group");
      } catch (err) {
        console.error("Access check failed:", err);
        setStatus("blocked");
      }
    };

    checkAccess();
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {status === "checking" ? (
            <>
              <ActivityIndicator size="large" color="#6200ee" />
              <Text style={styles.message}>Checking group access...</Text>
            </>
          ) : status === "blocked" ? (
            <>
              <Text style={styles.title}>Access Denied</Text>
              <Text style={styles.message}>
                You are blocked from this group.
              </Text>
              <TouchableOpacity onPress={onCancel} style={styles.button}>
                <Text style={styles.cancelText}>Close</Text>
              </TouchableOpacity>
            </>
          ) : status === "request-pending" ? (
            <>
              <Text style={styles.title}>Join Request Pending</Text>
              <Text style={styles.message}>
                You must be approved by the group admin to join this private
                group.
              </Text>
              <TouchableOpacity onPress={onCancel} style={styles.button}>
                <Text style={styles.cancelText}>OK</Text>
              </TouchableOpacity>
            </>
          ) : status === "join-group" ? (
            <>
              <Text style={styles.title}>Join {groupName}</Text>
              <Text style={styles.message}>
                Would you like to join this private group?
              </Text>
              <View style={styles.row}>
                <TouchableOpacity
                  onPress={onSendRequest}
                  style={styles.joinButton}
                >
                  <Text style={styles.joinText}>Request</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onCancel} style={styles.button}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : status === "not-member" ? (
            <>
              <Text style={styles.title}>Join {groupName}</Text>
              <Text style={styles.message}>
                Would you like to join this public group?
              </Text>
              <View style={styles.row}>
                <TouchableOpacity onPress={onJoin} style={styles.joinButton}>
                  <Text style={styles.joinText}>Join</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onCancel} style={styles.button}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : status === "allowed" ? (
            <>
              <Text style={styles.title}>You're already in!</Text>
              <Text style={styles.message}>Redirecting to chat...</Text>
              <ActivityIndicator size="small" />
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

export default GroupAccessModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.99)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#222",
  },
  message: {
    fontSize: 16,
    color: "#444",
    marginBottom: 20,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  joinButton: {
    backgroundColor: "#6200ee",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  joinText: {
    color: "#fff",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#eee",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  cancelText: {
    fontSize: 16,
    color: "#333",
  },
});
