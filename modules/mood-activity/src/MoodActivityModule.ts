import { requireNativeModule } from 'expo-modules-core';

// Requires native implementation in android/ and ios/ subdirectories
const MoodActivityNative = requireNativeModule('MoodActivity');

export default MoodActivityNative;
