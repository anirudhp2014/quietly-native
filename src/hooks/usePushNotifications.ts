import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import { supabase } from '@/lib/supabase';

export function usePushNotifications(userId: string | null) {
  useEffect(() => {
    if (!userId) return;

    const register = async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) return;

      const token = await Notifications.getExpoPushTokenAsync({ projectId });

      await supabase.from('device_tokens').upsert(
        { user_id: userId, token: token.data, platform: Platform.OS },
        { onConflict: 'user_id,token' },
      );
    };

    void register();

    const sub = Notifications.addNotificationReceivedListener((notification) => {
      const emoji = (notification.request.content.data?.mood_emoji as string) ?? '';
      Toast.show({ type: 'info', text1: `${emoji} New mood`, text2: 'Your partner sent a mood' });
    });

    return () => sub.remove();
  }, [userId]);
}
