import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseEnabled = Boolean(url && key);

// Agar sozlanmagan bo'lsa, dummy client (xato bo'lmasligi uchun)
export const supabase: SupabaseClient = isSupabaseEnabled
  ? createClient(url, key, {
      realtime: { params: { eventsPerSecond: 10 } },
    })
  : (createClient("https://placeholder.supabase.co", "placeholder") as SupabaseClient);
