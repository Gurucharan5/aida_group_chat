import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  onPress: () => void;
};

export const HeaderRightManage = ({ onPress }: Props) => (
  <TouchableOpacity style={{ marginRight: 15 }} onPress={onPress}>
    <Ionicons name="settings-outline" size={24} color="black" />
    <Text>Manage</Text>
  </TouchableOpacity>
);
