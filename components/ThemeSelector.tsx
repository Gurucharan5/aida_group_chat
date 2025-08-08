// ThemeSelector.tsx
import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
// import { useTheme, ThemeType } from "./ThemeContext";

type ThemeType = "light" | "dark" | "blue";

const themeOptions: ThemeType[] = ["light", "dark", "blue"];

export const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Theme:</Text>
      {themeOptions.map((t) => (
        <TouchableOpacity
          key={t}
          style={[
            styles.button,
            theme === t && styles.selectedButton,
          ]}
          onPress={() => setTheme(t)}
        >
          <Text style={styles.buttonText}>{t}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "bold",
  },
  button: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#eee",
    borderRadius: 8,
  },
  selectedButton: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    fontSize: 16,
  },
});
