import { Stack } from 'expo-router';
import { LanguageProvider } from '../context/LanguageContext';
import { GprProvider } from '../context/GprContext';

export default function RootLayout() {
  return (
    <LanguageProvider>
      <GprProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </GprProvider>
    </LanguageProvider>
  );
}

