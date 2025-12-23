export const config = { auth: false };

import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { email } = await req.json();
  if (!email) {
    return new Response(JSON.stringify({ error: "Email required" }), { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  await supabase.from("email_otps").upsert({
    email,
    otp,
    expires_at: expires,
    verified: false,
  });

  // 👉 TEMP: log OTP instead of email (NO SMTP)
  console.log("OTP for", email, "=", otp);

  return new Response(JSON.stringify({ success: true }), { status: 200 });
});
