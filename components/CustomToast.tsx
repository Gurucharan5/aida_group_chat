// components/CustomToast.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';

interface CustomToastProps {
  message: string;
  duration: number;
  onHide: () => void;
}

const CustomToast: React.FC<CustomToastProps> = ({ message, duration, onHide }) => {
  const [fadeAnim] = useState(new Animated.Value(0)); // Initial opacity 0

  useEffect(() => {
    // Fade in the toast
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Automatically hide the toast after the specified duration
    const timer = setTimeout(() => {
      hideToast();
    }, duration);

    // Clean up the timer
    return () => clearTimeout(timer);
  }, [fadeAnim, duration]);

  const hideToast = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Call onHide to remove the toast from the UI
    setTimeout(onHide, 500); // Wait for fade animation to finish
  };

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          opacity: fadeAnim, // Bind opacity to fadeAnim
        },
      ]}
    >
      <Text style={styles.toastMessage}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 50, // Position the toast at the top of the screen
    left: 20,
    right: 20,
    padding: 12,
    backgroundColor: '#333',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  toastMessage: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomToast;
