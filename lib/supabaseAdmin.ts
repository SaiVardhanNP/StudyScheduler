import { createClient } from "@supabase/supabase-js";

// ✅ Admin client → only use in server code (API routes, cron jobs)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // not exposed to client
);
