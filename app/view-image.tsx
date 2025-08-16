import React from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Text,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function ViewImageScreen() {
  const { imageUrl } = useLocalSearchParams<{ imageUrl: string }>();
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Background Blur */}
      <BlurView intensity={60} style={StyleSheet.absoluteFill} tint="dark" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
        >
          <Ionicons name="close" size={26} color="white" />
        </TouchableOpacity>
      </View>

      {/* Image */}
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="contain"
      />

      {/* Bottom Info */}
      <View style={styles.bottomBar}>
        <Text style={styles.infoText}>Aida Group Chat</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  topBar: {
    position: "absolute",
    top: 40,
    left: 15,
    right: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  iconButton: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 30,
    marginHorizontal: 5,
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width,
    height,
    flex: 1,
  },
  bottomBar: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  infoText: {
    color: "white",
    fontSize: 14,
  },
});
