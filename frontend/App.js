// File: frontend/App.js

import React, { useEffect, useState, useCallback } from "react";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LogBox, useColorScheme, View } from "react-native";

// --- Clean imports pointing to separate files ---
import AppNavigator from "./navigation/AppNavigator";
import { AppProvider } from "./context/AppContext";
import { ThemeProvider } from "./context/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingScreen from "./components/LoadingScreen";

// Suppress specific non-critical warnings
LogBox.ignoreLogs([
  "Warning: componentWillReceiveProps",
  "Warning: componentWillMount",
]);

// --- Define the themes ---
const CustomLightTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: "#007AFF", background: "#f0f0f0" },
};
const CustomDarkTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, primary: "#0A84FF", background: "#000000" },
};

// --- This is correct: prevent splash screen from auto-hiding ---
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const colorScheme = useColorScheme();

  // This is the main initialization function for the app
  const prepareApp = useCallback(async () => {
    try {
      // Pre-load any required fonts
      await Font.loadAsync({
        // Add your custom fonts here if you have any
        // 'Your-Font-Name': require('./assets/fonts/YourFont.ttf'),
      });
      // Simulate loading any other data if needed
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (e) {
      console.warn(e);
    } finally {
      // =========================================================
      // CRITICAL FIX: Tell the app it's ready to be rendered
      setIsReady(true);
      // =========================================================
    }
  }, []);

  useEffect(() => {
    prepareApp();
  }, [prepareApp]);

  // This callback will hide the splash screen
  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  // If the app is not ready, we will not render anything,
  // allowing the native splash screen to remain visible.
  if (!isReady) {
    return null;
  }

  const theme = colorScheme === "dark" ? CustomDarkTheme : CustomLightTheme;

  return (
    // We must have a root View for the onLayout prop to work
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <ThemeProvider>
            <AppProvider>
              <NavigationContainer theme={theme}>
                <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
                <AppNavigator />
              </NavigationContainer>
            </AppProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </View>
  );
}
