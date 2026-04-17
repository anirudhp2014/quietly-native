import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  requestPermission,
  showMoodActivity,
  updateMoodActivity,
  clearMoodActivity,
} from '../../modules/mood-activity/src';

export function useMoodActivity() {
  const show = useCallback(async (
    emoji: string,
    partnerEmoji?: string | null,
    partnerName?: string,
  ) => {
    const enabled = await AsyncStorage.getItem('mood_bar_enabled');
    if (enabled === '0') return;

    let hasPermission = (await AsyncStorage.getItem('mood_bar_permission')) === '1';
    if (!hasPermission) {
      hasPermission = await requestPermission();
      await AsyncStorage.setItem('mood_bar_permission', hasPermission ? '1' : '0');
    }
    if (!hasPermission) return;

    await showMoodActivity(emoji, partnerEmoji ?? undefined, partnerName);
  }, []);

  return {
    showMoodActivity: show,
    updateMoodActivity,
    clearMoodActivity,
  };
}
