import { supabase } from '@/lib/supabase';

describe('supabase client', () => {
  it('is defined', () => {
    expect(supabase).toBeDefined();
  });

  it('has auth property', () => {
    expect(supabase.auth).toBeDefined();
  });
});
