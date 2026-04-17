// Environment variables for testing
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-key-123456789';

// Expo's winter runtime (expo/src/winter/runtime.native.ts) installs lazy
// property getters on `global` for TextDecoder, URL, structuredClone, etc.
// These lazy getters call require() when first accessed. If accessed after
// isInsideTestCode===false (e.g. during renderHook teardown), jest-runtime
// throws "outside scope". We replace each lazy getter with a resolved value
// so the require() chain never fires during teardown.
const winterGlobals = [
  ['__ExpoImportMetaRegistry', { url: null }],
  ['structuredClone', global.structuredClone ?? ((v) => JSON.parse(JSON.stringify(v)))],
];
for (const [name, value] of winterGlobals) {
  try {
    Object.defineProperty(global, name, {
      value,
      configurable: true,
      writable: true,
      enumerable: false,
    });
  } catch (_) {
    // Property may be non-configurable in some environments; skip it
  }
}

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(null),
  clear: jest.fn().mockResolvedValue(null),
  multiGet: jest.fn().mockResolvedValue([]),
  multiSet: jest.fn().mockResolvedValue(null),
  getAllKeys: jest.fn().mockResolvedValue([]),
}));
