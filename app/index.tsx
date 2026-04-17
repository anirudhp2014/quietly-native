import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePairing } from '@/hooks/usePairing';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { LoadingScreen } from '@/components/LoadingScreen';
import PairingScreen from '@/screens/PairingScreen';
import HomeScreen from '@/screens/HomeScreen';

export default function Index() {
  const { user, loading, signOut } = useAuth();
  const { room, activeRoomId, pairingCode, isGenerating, isJoining, generateCode, joinWithCode, unpair } = usePairing(user?.id);
  usePushNotifications(user?.id ?? null);

  if (loading || !user) return <LoadingScreen />;

  if (!room) {
    return (
      <PairingScreen
        pairingCode={pairingCode}
        isGenerating={isGenerating}
        isJoining={isJoining}
        userId={user.id}
        onGenerate={generateCode}
        onJoin={joinWithCode}
      />
    );
  }

  return (
    <HomeScreen
      userId={user.id}
      room={room}
      activeRoomId={activeRoomId}
      onUnpair={unpair}
      onSignOut={signOut}
    />
  );
}
