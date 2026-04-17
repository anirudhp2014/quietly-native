import { renderHook, act } from '@testing-library/react-native';
import { useAuth } from '@/hooks/useAuth';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: jest.fn((cb: (event: string, session: { user: { id: string } } | null) => void) => {
        cb('SIGNED_IN', { user: { id: 'test-user-id' } });
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      }),
      getSession: jest.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user-id' } } },
      }),
      signInAnonymously: jest.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: jest.fn().mockResolvedValue({}),
    },
  },
}));

describe('useAuth', () => {
  it('returns a user after auth resolves', async () => {
    const { result } = renderHook(() => useAuth());
    await act(async () => {});
    expect(result.current.user).not.toBeNull();
    expect(result.current.user?.id).toBe('test-user-id');
  });

  it('exposes loading boolean', () => {
    const { result } = renderHook(() => useAuth());
    expect(typeof result.current.loading).toBe('boolean');
  });

  it('exposes signOut function', () => {
    const { result } = renderHook(() => useAuth());
    expect(typeof result.current.signOut).toBe('function');
  });
});
