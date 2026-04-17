import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-background items-center justify-center gap-4">
      <Text className="text-foreground text-xl">Page not found</Text>
      <Button onPress={() => router.replace('/')}>Go home</Button>
    </SafeAreaView>
  );
}
