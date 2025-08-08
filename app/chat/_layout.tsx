import { Stack } from "expo-router";

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Show headers so your `useLayoutEffect` works
      }}
    />
  );
}
