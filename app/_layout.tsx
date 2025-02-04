import { Stack } from "expo-router";
import { useAuth } from "../scripts/auth"

export default function RootLayout() {
  const { isAuthenticated } = useAuth();
  return (
    <Stack>
      {!isAuthenticated ? (
        <Stack.Screen
          name="auth"
          options={{ headerShown: false }}
        />
      ) : (
        <Stack.Screen
          name="main"
          options={{ headerShown: false }}
        />
      )}
    </Stack>
  );
}
