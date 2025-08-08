// import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
// import { themes, ThemeConfig } from "../hooks/themes"; // assume ThemeConfig is a type for each theme object
// import AsyncStorage from "@react-native-async-storage/async-storage";

// // 1. Define the context type
// interface ThemeContextType {
//   theme: keyof typeof themes;
//   setTheme: React.Dispatch<React.SetStateAction<keyof typeof themes>>;
//   themeConfig: ThemeConfig;
// }

// // 2. Create the context with an initial `undefined` value
// const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// // 3. Define the props type for the provider
// interface ThemeProviderProps {
//   children: ReactNode;
// }
// const THEME_KEY = "@app_theme";
// // 4. ThemeProvider component
// export const ThemeProvider = ({ children }: ThemeProviderProps) => {
//   const [theme, setTheme] = useState<keyof typeof themes>("light");
//   // Load theme from AsyncStorage
//   useEffect(() => {
//     const loadTheme = async () => {
//       const storedTheme = await AsyncStorage.getItem(THEME_KEY);
//       if (storedTheme && storedTheme in themes) {
//         setTheme(storedTheme as ThemeName);
//       }
//     };
//     loadTheme();
//   }, []);

//   // Update theme and persist it
//   const setTheme = async (newTheme: ThemeName) => {
//     setThemeState(newTheme);
//     await AsyncStorage.setItem(THEME_KEY, newTheme);
//   };

//   const value: ThemeContextType = {
//     theme,
//     setTheme,
//     themeConfig: themes[theme],
//   };

//   return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
// };

// // 5. Custom hook with error check
// export const useTheme = (): ThemeContextType => {
//   const context = useContext(ThemeContext);
//   if (!context) {
//     throw new Error("useTheme must be used within a ThemeProvider");
//   }
//   return context;
// };
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { themes, ThemeConfig, ThemeName } from "../hooks/themes";

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (newTheme: ThemeName) => void;
  themeConfig: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

const THEME_KEY = "@app_theme";

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<ThemeName>("light");

  // Load theme from AsyncStorage
  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (storedTheme && storedTheme in themes) {
        setThemeState(storedTheme as ThemeName);
      }
    };
    loadTheme();
  }, []);

  // Update theme and persist it
  const setTheme = async (newTheme: ThemeName) => {
    setThemeState(newTheme);
    await AsyncStorage.setItem(THEME_KEY, newTheme);
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    themeConfig: themes[theme],
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
