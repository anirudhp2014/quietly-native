import React from 'react';
import { Pressable, Text } from 'react-native';
import { Linking } from 'react-native';

interface MoodLocationBadgeProps {
  latitude?: number | null;
  longitude?: number | null;
  locationName?: string | null;
}

export function MoodLocationBadge({ latitude, longitude, locationName }: MoodLocationBadgeProps) {
  if (!latitude || !longitude) return null;

  const openMap = () => {
    Linking.openURL(`https://www.google.com/maps?q=${latitude},${longitude}`);
  };

  return (
    <Pressable onPress={openMap} className="flex-row items-center gap-1 mt-1">
      <Text className="text-xs text-primary">📍 {locationName || 'View on map'}</Text>
    </Pressable>
  );
}
