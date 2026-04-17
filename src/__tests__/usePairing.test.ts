import { renderHook, act } from '@testing-library/react-native';
import { usePairing } from '@/hooks/usePairing';

const mockChannel = {
  on: jest.fn().mockReturnThis(),
  subscribe: jest.fn().mockReturnThis(),
};

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [], error: null }),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
      insert: jest.fn().mockResolvedValue({ error: null }),
    }),
    channel: jest.fn(() => mockChannel),
    removeChannel: jest.fn(),
    rpc: jest.fn().mockResolvedValue({ data: 'room-id', error: null }),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(null),
  getItem: jest.fn().mockResolvedValue(null),
}));

jest.mock('react-native-toast-message', () => ({
  default: { show: jest.fn() },
}));

describe('usePairing', () => {
  it('initialises with null room', async () => {
    const { result } = renderHook(() => usePairing('user-123'));
    await act(async () => {});
    expect(result.current.room).toBeNull();
  });

  it('exposes generateCode function', () => {
    const { result } = renderHook(() => usePairing('user-123'));
    expect(typeof result.current.generateCode).toBe('function');
  });

  it('exposes joinWithCode function', () => {
    const { result } = renderHook(() => usePairing('user-123'));
    expect(typeof result.current.joinWithCode).toBe('function');
  });

  it('exposes unpair function', () => {
    const { result } = renderHook(() => usePairing('user-123'));
    expect(typeof result.current.unpair).toBe('function');
  });
});
