import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import type { Database } from '@/integrations/supabase/types';

type Mood = Database['public']['Tables']['moods']['Row'];

interface DashboardScreenProps {
  userId: string;
  roomId: string;
}

const SCREEN_W = Dimensions.get('window').width - 48;

function buildBarData(moods: Mood[]) {
  const counts: Record<string, number> = {};
  moods.forEach(m => { counts[m.emoji] = (counts[m.emoji] ?? 0) + 1; });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([emoji, count]) => ({ value: count, label: emoji, frontColor: '#1e293b' }));
}

function buildLineData(moods: Mood[]) {
  const byDay: Record<string, number> = {};
  moods.forEach(m => {
    const day = m.created_at.slice(0, 10);
    byDay[day] = (byDay[day] ?? 0) + 1;
  });
  return Object.entries(byDay)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-14)
    .map(([date, count]) => ({ value: count, label: date.slice(5) }));
}

function buildPieData(moods: Mood[]) {
  const counts: Record<string, number> = {};
  moods.forEach(m => { counts[m.emoji] = (counts[m.emoji] ?? 0) + 1; });
  const colors = ['#1e293b', '#475569', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9'];
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([emoji, count], i) => ({ value: count, text: emoji, color: colors[i] }));
}

export default function DashboardScreen({ userId, roomId }: DashboardScreenProps) {
  const router = useRouter();

  const { data: moods, isLoading } = useQuery({
    queryKey: ['moods', roomId],
    queryFn: async () => {
      const { data, error } = await supabase.from('moods').select('*').eq('room_id', roomId)
        .order('created_at', { ascending: false }).limit(200);
      if (error) throw error;
      return data as Mood[];
    },
    enabled: !!roomId,
  });

  const myMoods = moods?.filter(m => m.from_uid === userId) ?? [];
  const partnerMoods = moods?.filter(m => m.from_uid !== userId) ?? [];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center gap-3 px-4 py-3 border-b border-border">
        <Button variant="ghost" size="icon" onPress={() => router.back()}>
          <Text className="text-foreground text-lg">←</Text>
        </Button>
        <Text className="text-lg font-semibold text-foreground">Mood history</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1e293b" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingVertical: 24, gap: 24 }}>
          <View className="bg-card rounded-2xl p-4">
            <Text className="font-semibold text-foreground mb-4">Your top moods</Text>
            {myMoods.length > 0 ? (
              <BarChart
                data={buildBarData(myMoods)}
                width={SCREEN_W}
                height={200}
                barWidth={28}
                noOfSections={4}
                barBorderRadius={4}
                yAxisTextStyle={{ color: '#94a3b8', fontSize: 10 }}
                xAxisLabelTextStyle={{ fontSize: 18 }}
              />
            ) : <Text className="text-muted-foreground text-sm">No moods yet</Text>}
          </View>

          <View className="bg-card rounded-2xl p-4">
            <Text className="font-semibold text-foreground mb-4">Activity (last 14 days)</Text>
            {(moods?.length ?? 0) > 0 ? (
              <LineChart
                data={buildLineData(moods!)}
                width={SCREEN_W}
                height={160}
                color="#1e293b"
                thickness={2}
                dataPointsColor="#1e293b"
                yAxisTextStyle={{ color: '#94a3b8', fontSize: 10 }}
                xAxisLabelTextStyle={{ color: '#94a3b8', fontSize: 9 }}
                hideRules
              />
            ) : <Text className="text-muted-foreground text-sm">No data yet</Text>}
          </View>

          <View className="bg-card rounded-2xl p-4">
            <Text className="font-semibold text-foreground mb-4">Partner's mood breakdown</Text>
            {partnerMoods.length > 0 ? (
              <View className="items-center">
                <PieChart data={buildPieData(partnerMoods)} radius={80} donut innerRadius={50} />
              </View>
            ) : <Text className="text-muted-foreground text-sm">No partner moods yet</Text>}
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
