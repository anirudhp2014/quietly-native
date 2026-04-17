import { Platform, PermissionsAndroid } from 'react-native';
import * as Notifications from 'expo-notifications';
import MoodActivityNative from './MoodActivityModule';

export async function requestPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    if (Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true; // Android < 13 doesn't need runtime permission for notifications
  }
  if (Platform.OS === 'ios') {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }
  return false;
}

export async function showMoodActivity(
  emoji: string,
  partnerEmoji?: string,
  partnerName?: string,
): Promise<void> {
  try {
    await MoodActivityNative.showMoodActivity(emoji, partnerEmoji ?? '', partnerName ?? 'Partner');
  } catch (e) {
    console.warn('showMoodActivity failed:', e);
  }
}

export async function updateMoodActivity(
  emoji: string,
  partnerEmoji?: string,
): Promise<void> {
  try {
    await MoodActivityNative.updateMoodActivity(emoji, partnerEmoji ?? '');
  } catch (e) {
    console.warn('updateMoodActivity failed:', e);
  }
}

export async function clearMoodActivity(): Promise<void> {
  try {
    await MoodActivityNative.clearMoodActivity();
  } catch (e) {
    console.warn('clearMoodActivity failed:', e);
  }
}
