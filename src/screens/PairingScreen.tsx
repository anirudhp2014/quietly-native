import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface PairingScreenProps {
  pairingCode: string | null;
  isGenerating: boolean;
  isJoining: boolean;
  userId: string;
  onGenerate: () => void;
  onJoin: (code: string) => void;
}

export default function PairingScreen({
  pairingCode,
  isGenerating,
  isJoining,
  onGenerate,
  onJoin,
}: PairingScreenProps) {
  const [tab, setTab] = useState<'generate' | 'join'>('generate');
  const [code, setCode] = useState('');

  const handleCodeChange = (text: string) => {
    const upper = text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setCode(upper);
    if (upper.length === 6) onJoin(upper);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6 gap-8">
        <Text className="text-3xl font-semibold text-foreground">quietly</Text>
        <Text className="text-muted-foreground text-sm text-center">
          Connect with your partner to share moods silently.
        </Text>

        <View className="flex-row border border-border rounded-lg overflow-hidden w-full">
          {(['generate', 'join'] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              className={`flex-1 py-2.5 items-center ${tab === t ? 'bg-primary' : 'bg-background'}`}
            >
              <Text className={`text-sm font-medium ${tab === t ? 'text-primary-foreground' : 'text-foreground'}`}>
                {t === 'generate' ? 'Get code' : 'Enter code'}
              </Text>
            </Pressable>
          ))}
        </View>

        {tab === 'generate' && (
          <View className="items-center gap-6 w-full">
            {pairingCode ? (
              <>
                <Text className="text-5xl tracking-[0.3em] text-foreground">{pairingCode}</Text>
                <QRCode value={pairingCode} size={160} />
                <Text className="text-xs text-muted-foreground text-center">
                  Share this code with your partner. Waiting for them to join…
                </Text>
                <ActivityIndicator size="small" color="#1e293b" />
              </>
            ) : (
              <Button onPress={onGenerate} loading={isGenerating} className="w-full">
                Generate pairing code
              </Button>
            )}
          </View>
        )}

        {tab === 'join' && (
          <View className="gap-4 w-full">
            <Input
              value={code}
              onChangeText={handleCodeChange}
              placeholder="Enter 6-char code"
              autoCapitalize="characters"
              maxLength={6}
              className="text-center text-2xl tracking-widest"
              autoFocus
            />
            <Button onPress={() => onJoin(code)} loading={isJoining} disabled={code.length !== 6} className="w-full">
              Join
            </Button>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
