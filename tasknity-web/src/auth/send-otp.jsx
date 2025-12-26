export const config = { auth: false };

import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { email } = await req.json();

  if (!email) {
    return new Response(
      JSON.stringify({ error: "Email required" }),
      { status: 400, headers: corsHeaders }
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  // Invalidate old OTPs
  await supabase
    .from("email_otps")
    .update({ verified: true })
    .eq("email", email);

  // Save new OTP
  await supabase.from("email_otps").insert({
    email,
    otp,
    expires_at: expires,
  });

  console.log("OTP for", email, "=>", otp);

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: corsHeaders }
  );
});
