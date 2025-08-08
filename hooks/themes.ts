export const themes = {
  light: {
    background: "#FFFFFF",
    text: "#000000",
    tab: "#F3F4F6",
    icon: "#000000",
  },
  dark: {
    background: "#000000",
    text: "#FFFFFF",
    tab: "#1F2937",
    icon: "#FFFFFF",
  },
  blue: {
    background: "#E0F2FE",
    text: "#0369A1",
    tab: "#0284C7",
    icon: "#0369A1",
  },
} as const;

export type ThemeName = keyof typeof themes; // "light" | "dark" | "blue"

export type ThemeConfig = typeof themes[ThemeName];
