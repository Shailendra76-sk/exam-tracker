import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  'https://kmaesiinprjlxpuphefs.supabase.co';

// Supabase publishable/anon keys are intended for browser clients.
// RLS must protect every user-owned table; never put a service_role key here.
const SUPABASE_PUBLISHABLE_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  'sb_publishable_IYN7gQW0Isz2BA_BIhu1cg_MdMECRbB';

export const supabase = SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY
   ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
