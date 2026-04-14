// Prevent Expo from loading native modules
jest.mock('expo', () => {
  return {};
}, { virtual: true });

jest.mock('expo/config', () => {
  return {};
}, { virtual: true });

// Mock the winter/installGlobal module that's causing issues
jest.doMock('expo/src/winter/installGlobal', () => {
  return {};
}, { virtual: true });

jest.mock('@react-native-async-storage/async-storage', () => {
  return {
    __esModule: true,
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
});

// Set up environment variables for testing
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-key-123456789';
