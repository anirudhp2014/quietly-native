import React from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';

interface AvatarProps {
  src?: string | null;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = { sm: 32, md: 48, lg: 96 };

export function Avatar({ src, fallback = '?', size = 'md', className = '' }: AvatarProps) {
  const px = sizeMap[size];
  return (
    <View
      className={`rounded-full bg-accent items-center justify-center overflow-hidden ${className}`}
      style={{ width: px, height: px }}
    >
      {src ? (
        <Image source={{ uri: src }} style={{ width: px, height: px }} contentFit="cover" />
      ) : (
        <Text className="text-accent-foreground font-display" style={{ fontSize: px * 0.35 }}>
          {fallback.slice(0, 2).toUpperCase()}
        </Text>
      )}
    </View>
  );
}
