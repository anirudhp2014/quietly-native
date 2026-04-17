import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePairing } from '@/hooks/usePairing';
import DashboardScreen from '@/screens/DashboardScreen';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function Dashboard() {
  const { user } = useAuth();
  const { activeRoomId } = usePairing(user?.id);
  if (!user || !activeRoomId) return <LoadingScreen />;
  return <DashboardScreen userId={user.id} roomId={activeRoomId} />;
}
