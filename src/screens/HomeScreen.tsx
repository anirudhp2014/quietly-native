import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import { REPLY_EMOJIS, KISS_EMOJIS, LOCATION_EMOJIS } from '@/lib/constants';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { MoodGrid } from '@/components/MoodGrid';
import { MeetingTimer } from '@/components/MeetingTimer';
import { MoodLocationBadge } from '@/components/MoodLocationBadge';
import { useMoodActivity } from '@/hooks/useMoodActivity';
import type { Database } from '@/integrations/supabase/types';

type Mood = Database['public']['Tables']['moods']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Room = Database['public']['Tables']['rooms']['Row'];

interface HomeScreenProps {
  userId: string;
  room: Room;
  activeRoomId: string | null;
  onUnpair: () => void;
  onSignOut: () => void;
}

export default function HomeScreen({ userId, room, activeRoomId, onUnpair, onSignOut }: HomeScreenProps) {
  const router = useRouter();
  const [latestPartnerMood, setLatestPartnerMood] = useState<Mood | null>(null);
  const [latestMyMood, setLatestMyMood] = useState<Mood | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<Profile | null>(null);
  const [sending, setSending] = useState(false);
  const [tappedEmoji, setTappedEmoji] = useState<string | null>(null);
  const { showMoodActivity } = useMoodActivity();

  const partnerId = room.user_a_uid === userId ? room.user_b_uid : room.user_a_uid;

  useEffect(() => {
    supabase.from('profiles').select('*').eq('id', partnerId).single()
      .then(({ data }) => { if (data) setPartnerProfile(data as Profile); });
  }, [partnerId]);

  const fetchLatestMoods = useCallback(async () => {
    if (!activeRoomId) return;
    const { data } = await supabase.from('moods').select('*').eq('room_id', activeRoomId)
      .order('created_at', { ascending: false }).limit(10);
    if (data) {
      setLatestPartnerMood((data as Mood[]).find(m => m.from_uid !== userId) ?? null);
      setLatestMyMood((data as Mood[]).find(m => m.from_uid === userId) ?? null);
    }
  }, [activeRoomId, userId]);

  useEffect(() => { fetchLatestMoods(); }, [fetchLatestMoods]);

  useEffect(() => {
    if (!activeRoomId) return;
    const channel = supabase.channel(`moods-${activeRoomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'moods', filter: `room_id=eq.${activeRoomId}` },
        (payload) => {
          void fetchLatestMoods();
          if (payload.eventType === 'INSERT') {
            const mood = payload.new as Mood;
            if (mood.from_uid !== userId) {
              if (mood.emoji === '💭') {
                void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Toast.show({ type: 'info', text1: '💭 Thinking of you', text2: `${partnerProfile?.display_name ?? 'Partner'} is thinking of you!` });
              } else if (KISS_EMOJIS.includes(mood.emoji)) {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              } else {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }
          }
        }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [activeRoomId, userId, fetchLatestMoods, partnerProfile]);

  const getLocation = async (): Promise<{ lat: number; lng: number } | null> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    return { lat: loc.coords.latitude, lng: loc.coords.longitude };
  };

  const sendMood = async (emoji: string) => {
    if (sending || !activeRoomId) return;
    setSending(true);
    setTappedEmoji(emoji);
    setTimeout(() => setTappedEmoji(null), 600);
    try {
      let lat: number | null = null, lng: number | null = null;
      if (LOCATION_EMOJIS.includes(emoji)) {
        const loc = await getLocation();
        if (!loc) { Toast.show({ type: 'error', text1: 'Could not get location. Enable location access.' }); setSending(false); return; }
        lat = loc.lat; lng = loc.lng;
      }
      await supabase.from('moods').insert({
        from_uid: userId, room_id: activeRoomId, emoji,
        ...(lat != null && lng != null ? { latitude: lat, longitude: lng } : {}),
      });
      void supabase.functions.invoke('send-mood-notification', { body: { mood_emoji: emoji, from_uid: userId, room_id: activeRoomId } });
      await showMoodActivity(emoji, latestPartnerMood?.emoji, partnerProfile?.display_name ?? 'Partner');
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to send mood' });
    } finally {
      setSending(false);
    }
  };

  const sendReply = async (moodId: string, replyEmoji: string) => {
    await supabase.from('moods').update({ reply_emoji: replyEmoji }).eq('id', moodId);
  };

  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Text className="text-lg font-semibold text-foreground">quietly</Text>
        <View className="flex-row gap-1">
          <Button variant="ghost" size="icon" onPress={() => router.push('/dashboard')}>
            <Text className="text-foreground">📊</Text>
          </Button>
          <Button variant="ghost" size="icon" onPress={() => router.push('/settings')}>
            <Text className="text-foreground">⚙️</Text>
          </Button>
          <Button variant="ghost" size="icon" onPress={onUnpair}>
            <Text className="text-foreground">🔓</Text>
          </Button>
          <Button variant="ghost" size="icon" onPress={onSignOut}>
            <Text className="text-foreground">↩️</Text>
          </Button>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 32, gap: 24 }}>
        {latestPartnerMood ? (
          <Animated.View entering={FadeIn} key={latestPartnerMood.id} style={{ alignItems: 'center', gap: 12 }}>
            <View className="flex-row items-center gap-2">
              <Avatar src={partnerProfile?.avatar_url} fallback={partnerProfile?.display_name ?? 'A'} size="sm" />
              <Text className="text-sm text-muted-foreground">{partnerProfile?.display_name ?? 'Partner'} is feeling</Text>
            </View>
            <Text style={{ fontSize: 80 }}>{latestPartnerMood.emoji}</Text>
            <Text className="text-xs text-muted-foreground">{formatTime(latestPartnerMood.created_at)}</Text>
            <MoodLocationBadge latitude={latestPartnerMood.latitude} longitude={latestPartnerMood.longitude} locationName={latestPartnerMood.location_name} />
            {!latestPartnerMood.reply_emoji && latestPartnerMood.from_uid !== userId ? (
              <View className="flex-row gap-2 mt-2">
                {REPLY_EMOJIS.map((e) => (
                  <Pressable key={e} onPress={() => void sendReply(latestPartnerMood.id, e)}>
                    <Text style={{ fontSize: 28 }}>{e}</Text>
                  </Pressable>
                ))}
              </View>
            ) : latestPartnerMood.reply_emoji ? (
              <Text className="text-xs text-muted-foreground">
                {latestPartnerMood.from_uid === userId ? 'They' : 'You'} replied {latestPartnerMood.reply_emoji}
              </Text>
            ) : null}
          </Animated.View>
        ) : (
          <View className="items-center gap-2">
            <Text style={{ fontSize: 48 }}>🌙</Text>
            <Text className="text-sm text-muted-foreground">No moods yet. Send the first one!</Text>
          </View>
        )}

        {latestMyMood && (
          <View className="items-center gap-1 opacity-70">
            <Text className="text-xs text-muted-foreground uppercase tracking-widest">You sent</Text>
            <Text style={{ fontSize: 32 }}>{latestMyMood.emoji}</Text>
            <MoodLocationBadge latitude={latestMyMood.latitude} longitude={latestMyMood.longitude} locationName={latestMyMood.location_name} />
            {latestMyMood.reply_emoji && (
              <Text className="text-xs text-muted-foreground">They replied {latestMyMood.reply_emoji}</Text>
            )}
          </View>
        )}

        {activeRoomId && (
          <View className="w-full" style={{ maxWidth: 320 }}>
            <MeetingTimer roomId={activeRoomId} userId={userId} partnerName={partnerProfile?.display_name ?? 'Partner'} />
          </View>
        )}
      </ScrollView>

      <View className="px-3 pt-4">
        <Button variant="outline" onPress={() => void sendMood('💭')} disabled={sending || !activeRoomId} className="w-full">
          ❤️  Thinking of you
        </Button>
      </View>

      <MoodGrid onSelect={(e) => void sendMood(e)} disabled={sending} tappedEmoji={tappedEmoji} />
    </SafeAreaView>
  );
}
