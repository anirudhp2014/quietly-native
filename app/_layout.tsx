import '../src/global.css';
import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';
import { supabase } from '@/lib/supabase';

const queryClient = new QueryClient();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_600SemiBold });

  useEffect(() => {
    void Notifications.setNotificationChannelAsync('moods', {
      name: 'Mood updates',
      importance: Notifications.AndroidImportance.HIGH,
    });

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') supabase.realtime.connect();
      else supabase.realtime.disconnect();
    });
    return () => sub.remove();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <Toast />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
