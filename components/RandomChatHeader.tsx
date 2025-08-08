import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

const RandomChatHeader = () => {
  const { themeConfig } = useTheme();
  const BackgroundColor = themeConfig.background;
  const TextColor = themeConfig.text;
  const ListColor = themeConfig.tab;
  return (
    <View style={[styles.container, { backgroundColor: BackgroundColor }]}>
      <Text style={[styles.title, { color: TextColor }]}>Random Chat</Text>
    </View>
  );
};

export default RandomChatHeader;

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff", // optional
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  buttonText: {
    marginLeft: 6,
  },
});
