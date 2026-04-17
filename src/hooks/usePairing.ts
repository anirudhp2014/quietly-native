import { useState, useEffect, useCallback, useRef } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { generatePairingCode } from '@/lib/constants';
import Toast from 'react-native-toast-message';
import type { Database } from '@/integrations/supabase/types';

type Room = Database['public']['Tables']['rooms']['Row'];

export function usePairing(userId: string | undefined) {
  const [room, setRoom] = useState<Room | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roomsChannelRef = useRef<RealtimeChannel | null>(null);

  const fetchRoom = useCallback(async () => {
    if (!userId) return;
    const now = new Date().toISOString();
    const { data } = await supabase
      .from('rooms')
      .select('*')
      .or(`user_a_uid.eq.${userId},user_b_uid.eq.${userId}`)
      .limit(1);

    const activeRoom = (data || []).find((r) => !r.expires_at || r.expires_at > now);
    setRoom(activeRoom || null);

    if (activeRoom) {
      await AsyncStorage.setItem('quietly_active_room', activeRoom.id);
    } else {
      await AsyncStorage.removeItem('quietly_active_room');
    }
  }, [userId]);

  useEffect(() => { fetchRoom(); }, [fetchRoom]);

  const fetchRoomRef = useRef(fetchRoom);
  fetchRoomRef.current = fetchRoom;

  useEffect(() => {
    if (!userId) return;
    const channelId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    if (roomsChannelRef.current) {
      void supabase.removeChannel(roomsChannelRef.current);
      roomsChannelRef.current = null;
    }

    const channel = supabase
      .channel(`rooms-${userId}-${channelId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
        void fetchRoomRef.current();
      })
      .subscribe();

    roomsChannelRef.current = channel;
    return () => {
      roomsChannelRef.current = null;
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  const generateCode = async () => {
    if (!userId) return;
    if (room) {
      Toast.show({ type: 'error', text1: 'Unpair first to connect with someone new.' });
      return;
    }
    setIsGenerating(true);
    try {
      await supabase.from('pairing_codes').delete().eq('creator_uid', userId);
      const code = generatePairingCode();
      const { error } = await supabase.from('pairing_codes').insert({ code, creator_uid: userId });
      if (error) throw error;
      setPairingCode(code);

      if (pollingRef.current) clearInterval(pollingRef.current);
      const startTime = Date.now();
      pollingRef.current = setInterval(async () => {
        if (Date.now() - startTime > 300000) {
          if (pollingRef.current) clearInterval(pollingRef.current);
          return;
        }
        await fetchRoom();
      }, 2000);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to generate code. Try again.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const joinWithCode = async (code: string) => {
    if (!userId || code.length !== 6 || room) return;
    setIsJoining(true);
    try {
      const { error } = await supabase.rpc('join_with_code', { _code: code.toUpperCase().trim() });
      if (error) throw error;
      Toast.show({ type: 'success', text1: 'Paired successfully!' });
      await fetchRoom();
    } catch (err) {
      Toast.show({ type: 'error', text1: err instanceof Error ? err.message : 'Failed to pair.' });
    } finally {
      setIsJoining(false);
    }
  };

  const unpair = async () => {
    if (!room) return;
    await supabase.from('rooms').delete().eq('id', room.id);
    setRoom(null);
    await AsyncStorage.removeItem('quietly_active_room');
    Toast.show({ type: 'success', text1: 'Unpaired successfully' });
  };

  useEffect(() => () => { if (pollingRef.current) clearInterval(pollingRef.current); }, []);

  return {
    room,
    activeRoomId: room?.id || null,
    pairingCode,
    isGenerating,
    isJoining,
    generateCode,
    joinWithCode,
    unpair,
    fetchRoom,
  };
}
