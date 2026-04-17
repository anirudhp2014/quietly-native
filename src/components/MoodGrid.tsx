import React from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { ALL_EMOJIS } from '@/lib/constants';

interface MoodGridProps {
  onSelect: (emoji: string) => void;
  disabled?: boolean;
  tappedEmoji?: string | null;
}

function EmojiCell({ emoji, onSelect, disabled, tapped }: {
  emoji: string;
  onSelect: (e: string) => void;
  disabled: boolean;
  tapped: boolean;
}) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[style, { flex: 1 / 6 }]}>
      <Pressable
        onPress={() => {
          if (disabled) return;
          scale.value = withSpring(1.3, {}, () => { scale.value = withSpring(1); });
          onSelect(emoji);
        }}
        className={`p-2 rounded-lg items-center justify-center ${tapped ? 'bg-accent' : ''} ${disabled ? 'opacity-50' : ''}`}
      >
        <Text style={{ fontSize: 28 }}>{emoji}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function MoodGrid({ onSelect, disabled = false, tappedEmoji }: MoodGridProps) {
  return (
    <View className="border-t border-border bg-card px-3 py-4">
      <FlatList
        data={ALL_EMOJIS}
        keyExtractor={(e) => e}
        numColumns={6}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <EmojiCell
            emoji={item}
            onSelect={onSelect}
            disabled={disabled}
            tapped={tappedEmoji === item}
          />
        )}
      />
    </View>
  );
}
