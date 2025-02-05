// app/_layout.js
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from "expo-font";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        "hyundai": require("@/assets/fonts/HyundaiSansTextOffice-Regular.ttf"),
        "hyundai-Bold": require("../assets/fonts/HyundaiSansTextOffice-Bold.ttf"),
        "hyundai-Medium": require("../assets/fonts/HyundaiSansTextOffice-Medium.ttf"),
        "space-mono": require("../assets/fonts/SpaceMono-Regular.ttf"),
      });
      setFontsLoaded(true);
    }
    
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      setIsAuthenticated(!!token);
    };

    loadFonts();
    checkToken();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      {!isAuthenticated ? (
        <Stack.Screen name="index" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      )}
    </Stack>
  );
}