import React, { useState, useEffect } from 'react';
import { View, Text, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { useMoodActivity } from '@/hooks/useMoodActivity';

interface SettingsScreenProps {
  userId: string;
}

export default function SettingsScreen({ userId }: SettingsScreenProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [moodBarEnabled, setMoodBarEnabled] = useState(true);
  const { clearMoodActivity } = useMoodActivity();

  useEffect(() => {
    supabase.from('profiles').select('*').eq('id', userId).single()
      .then(({ data }) => {
        if (data) { setDisplayName(data.display_name ?? ''); setAvatarUrl(data.avatar_url ?? null); }
      });
    AsyncStorage.getItem('mood_bar_enabled').then(v => {
      if (v !== null) setMoodBarEnabled(v === '1');
    });
  }, [userId]);

  const saveProfile = async () => {
    if (!displayName.trim()) { Toast.show({ type: 'error', text1: 'Name cannot be empty' }); return; }
    setSaving(true);
    const { error } = await supabase.from('profiles').upsert({ id: userId, display_name: displayName.trim(), avatar_url: avatarUrl });
    setSaving(false);
    if (error) Toast.show({ type: 'error', text1: 'Failed to save' });
    else Toast.show({ type: 'success', text1: 'Profile updated' });
  };

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    if ((asset.fileSize ?? 0) > 2 * 1024 * 1024) { Toast.show({ type: 'error', text1: 'Max file size is 2MB' }); return; }
    setUploading(true);
    const ext = asset.uri.split('.').pop() ?? 'jpg';
    const path = `${userId}/avatar.${ext}`;
    const response = await fetch(asset.uri);
    const blob = await response.blob();
    const { error } = await supabase.storage.from('avatars').upload(path, blob, { upsert: true, contentType: `image/${ext}` });
    if (error) { Toast.show({ type: 'error', text1: 'Upload failed' }); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    const url = `${publicUrl}?t=${Date.now()}`;
    setAvatarUrl(url);
    await supabase.from('profiles').upsert({ id: userId, avatar_url: url });
    setUploading(false);
    Toast.show({ type: 'success', text1: 'Avatar updated' });
  };

  const toggleMoodBar = async (val: boolean) => {
    setMoodBarEnabled(val);
    await AsyncStorage.setItem('mood_bar_enabled', val ? '1' : '0');
    if (!val) await clearMoodActivity();
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center gap-3 px-4 py-3 border-b border-border">
        <Button variant="ghost" size="icon" onPress={() => router.back()}>
          <Text className="text-foreground text-lg">←</Text>
        </Button>
        <Text className="text-lg font-semibold text-foreground">Settings</Text>
      </View>

      <View className="p-6 gap-8">
        <View className="items-center gap-3">
          <Button variant="ghost" onPress={() => void pickAvatar()} disabled={uploading}>
            <View style={{ position: 'relative' }}>
              <Avatar src={avatarUrl} fallback={displayName || 'A'} size="lg" />
              {uploading && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 48, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator size="small" color="white" />
                </View>
              )}
            </View>
          </Button>
          <Text className="text-xs text-muted-foreground">Tap to change photo</Text>
        </View>

        <View className="gap-2">
          <Text className="text-sm text-foreground font-medium">Display Name</Text>
          <Input
            value={displayName}
            onChangeText={(t) => setDisplayName(t.slice(0, 50))}
            placeholder="Your name"
          />
        </View>

        <View className="flex-row items-center justify-between py-4 border-b border-border">
          <View style={{ flex: 1, gap: 4 }}>
            <Text className="text-foreground font-medium">Show mood in notification bar</Text>
            <Text className="text-xs text-muted-foreground">Displays your current mood as a persistent notification</Text>
          </View>
          <Switch value={moodBarEnabled} onValueChange={(v) => void toggleMoodBar(v)} />
        </View>

        <Button onPress={() => void saveProfile()} loading={saving} className="w-full">
          Save Changes
        </Button>
      </View>
    </SafeAreaView>
  );
}
