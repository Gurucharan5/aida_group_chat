import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";
import { StyleSheet, View, Button } from "react-native";

export default function VideoMessagePlayer({ videoUrl }: { videoUrl: string }) {
  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = false;
    player.pause(); // Start paused
  });

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  return (
    <View style={styles.container}>
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
      />
      <View style={styles.controls}>
        <Button
          title={isPlaying ? "Pause" : "Play"}
          onPress={() => (isPlaying ? player.pause() : player.play())}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    alignItems: "center",
  },
  video: {
    width: 300,
    height: 220,
  },
  controls: {
    marginTop: 10,
  },
});
