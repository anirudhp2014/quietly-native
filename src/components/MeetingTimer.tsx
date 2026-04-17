import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import Toast from 'react-native-toast-message';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Meeting {
  id: string;
  room_id: string;
  proposed_by: string;
  meeting_time: string;
  status: string;
}

interface MeetingTimerProps {
  roomId: string;
  userId: string;
  partnerName: string;
}

export function MeetingTimer({ roomId, userId, partnerName }: MeetingTimerProps) {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [open, setOpen] = useState(false);
  const [dateValue, setDateValue] = useState('');
  const [timeValue, setTimeValue] = useState('');
  const [remaining, setRemaining] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMeeting = useCallback(async () => {
    const { data } = await supabase
      .from('meetings')
      .select('*')
      .eq('room_id', roomId)
      .in('status', ['pending', 'accepted'])
      .order('created_at', { ascending: false })
      .limit(1);
    setMeeting(data && data.length > 0 ? (data[0] as Meeting) : null);
  }, [roomId]);

  useEffect(() => { fetchMeeting(); }, [fetchMeeting]);

  useEffect(() => {
    const channel = supabase
      .channel(`meetings-${roomId}-${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meetings', filter: `room_id=eq.${roomId}` }, fetchMeeting)
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [roomId, fetchMeeting]);

  useEffect(() => {
    if (!meeting || meeting.status !== 'accepted') { setRemaining(''); return; }
    const update = () => {
      const diff = new Date(meeting.meeting_time).getTime() - Date.now();
      if (diff <= 0) { setRemaining('Now! 🎉'); return false; }
      const days = Math.floor(diff / 86400000);
      const hrs = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      if (days > 0) setRemaining(`${days}d ${hrs}h ${mins}m`);
      else if (hrs > 0) setRemaining(`${hrs}h ${mins}m ${secs}s`);
      else setRemaining(`${mins}m ${secs}s`);
      return true;
    };
    if (!update()) return;
    const interval = setInterval(() => { if (!update()) clearInterval(interval); }, 1000);
    return () => clearInterval(interval);
  }, [meeting]);

  const propose = async () => {
    if (!dateValue || !timeValue) { Toast.show({ type: 'error', text1: 'Select date and time' }); return; }
    setSubmitting(true);
    try {
      const meetingTime = new Date(`${dateValue}T${timeValue}`).toISOString();
      if (new Date(meetingTime) <= new Date()) { Toast.show({ type: 'error', text1: 'Pick a future time' }); return; }
      await supabase.from('meetings').delete().eq('room_id', roomId);
      const { error } = await supabase.from('meetings').insert({ room_id: roomId, proposed_by: userId, meeting_time: meetingTime, status: 'pending' });
      if (error) throw error;
      Toast.show({ type: 'success', text1: 'Meeting time proposed!' });
      setOpen(false); setDateValue(''); setTimeValue('');
    } catch { Toast.show({ type: 'error', text1: 'Failed to propose' }); }
    finally { setSubmitting(false); }
  };

  const respond = async (accept: boolean) => {
    if (!meeting) return;
    await supabase.from('meetings').update({ status: accept ? 'accepted' : 'declined' }).eq('id', meeting.id);
    Toast.show({ type: 'success', text1: accept ? 'Meeting accepted! ✨' : 'Meeting declined' });
  };

  const isPending = meeting?.status === 'pending';
  const isAccepted = meeting?.status === 'accepted';
  const isProposer = meeting?.proposed_by === userId;
  const fmtTime = (t: string) => new Date(t).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <View className="w-full">
      {isPending && !isProposer && (
        <View className="flex-row items-center gap-2 bg-accent rounded-lg px-3 py-2 mb-3">
          <Text className="text-foreground flex-1 text-xs">{partnerName} wants to meet at {fmtTime(meeting!.meeting_time)}</Text>
          <Pressable onPress={() => respond(true)}><Text className="text-green-500 text-lg">✓</Text></Pressable>
          <Pressable onPress={() => respond(false)}><Text className="text-destructive text-lg">✕</Text></Pressable>
        </View>
      )}
      {isPending && isProposer && (
        <View className="flex-row items-center gap-2 bg-accent rounded-lg px-3 py-2 mb-3">
          <Text className="text-muted-foreground text-xs flex-1">Waiting for {partnerName} to accept at {fmtTime(meeting!.meeting_time)}</Text>
        </View>
      )}
      {isAccepted && remaining && (
        <View className="items-center bg-background border border-border rounded-lg px-4 py-3 mb-3">
          <Text className="text-xs text-muted-foreground">Next meeting in</Text>
          <Text className="text-lg font-bold text-primary">{remaining}</Text>
        </View>
      )}
      <Button variant="outline" size="sm" onPress={() => setOpen(true)} className="w-full">
        {meeting ? 'Change meeting time' : 'Set next meeting'}
      </Button>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-black/50 items-center justify-center" onPress={() => setOpen(false)}>
          <Pressable className="bg-background rounded-2xl p-6 w-72 gap-4" onPress={() => {}}>
            <Text className="text-foreground text-center text-base font-semibold">Propose meeting time</Text>
            <View className="gap-1">
              <Text className="text-xs text-muted-foreground">Date (YYYY-MM-DD)</Text>
              <Input value={dateValue} onChangeText={setDateValue} placeholder="2026-04-15" keyboardType="numeric" />
            </View>
            <View className="gap-1">
              <Text className="text-xs text-muted-foreground">Time (HH:MM)</Text>
              <Input value={timeValue} onChangeText={setTimeValue} placeholder="18:00" keyboardType="numeric" />
            </View>
            <Button onPress={propose} loading={submitting} disabled={!dateValue || !timeValue}>Propose</Button>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
