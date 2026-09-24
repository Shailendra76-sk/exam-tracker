import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  'https://kmaesiinprjlxpuphefs.supabase.co';

const SUPABASE_PUBLISHABLE_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  'sb_publishable_IYN7gQW0Isz2BA_BIhu1cg_MdMECRbB';

let supabase: SupabaseClient | null = null;

try {
  supabase = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    },
  );
} catch (error) {
  console.error('Field Log: Supabase client initialization failed.', error);
}

export { supabase };
