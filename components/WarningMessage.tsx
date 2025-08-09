import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function WarningMessage({ message }: { message: string }) {
  return (
    <View style={styles.container}>
      <Ionicons
        name="alert-circle"
        size={22}
        color="#b71c1c"
        style={styles.icon}
      />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffebee", // light red background
    borderLeftWidth: 4,
    borderLeftColor: "#d32f2f", // deep red border
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginVertical: 8,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    flex: 1,
    color: "#b71c1c",
    fontSize: 14,
    fontWeight: "500",
  },
});
