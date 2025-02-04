// app/_layout.js
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      setIsAuthenticated(!!token);
    };

    checkToken();
  }, []);

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