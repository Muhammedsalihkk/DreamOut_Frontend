import { Stack } from 'expo-router';
import { ThemeProvider, DarkTheme } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="user/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="route/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="journey/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="journey-mode/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="spot/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
