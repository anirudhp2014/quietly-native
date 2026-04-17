import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import SettingsScreen from '@/screens/SettingsScreen';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function Settings() {
  const { user } = useAuth();
  if (!user) return <LoadingScreen />;
  return <SettingsScreen userId={user.id} />;
}
