import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"] as string;
const supabaseAnonKey = import.meta.env["VITE_SUPABASE_KEY"] as string;

/** Browser-side Supabase client (reads/writes cookies automatically) */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
