// app/video-player.tsx
import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { useLocalSearchParams, useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function VideoPlayerScreen() {
  const { videoUrl } = useLocalSearchParams<{ videoUrl: string }>();
  const router = useRouter();

  // Create a player
  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = false; // set loop true if you want repeat
    player.play(); // auto play
  });

  return (
    <View style={styles.container}>
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
        nativeControls
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: width,
    height: (width * 9) / 16, // 16:9 ratio
    borderRadius: 12,
  },
});
