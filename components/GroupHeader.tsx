// components/GroupHeader.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";

interface GroupHeaderProps {
  groupName: string;
  groupId: string;
}

const GroupHeader: React.FC<GroupHeaderProps> = ({ groupName, groupId }) => {
  const router = useRouter();
  const { themeConfig } = useTheme();
  const BackgroundColor = themeConfig.background;
  const TextColor = themeConfig.text;
  const ListColor = themeConfig.tab;
  const IconColor = themeConfig.icon;
  return (
    <View style={[styles.container, { backgroundColor: BackgroundColor }]}>
      <Text style={[styles.title, { color: TextColor }]}>{groupName}</Text>
      <TouchableOpacity
        onPress={() => router.push(`/groupSettings/${groupId}`)}
        style={styles.button}
      >
        <Ionicons name="settings-outline" size={24} color={IconColor} />
        <Text style={[styles.buttonText, { color: TextColor }]}>Manage</Text>
      </TouchableOpacity>
    </View>
  );
};

export default GroupHeader;

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
