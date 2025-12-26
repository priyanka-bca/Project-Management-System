import { serve } from "deno";
import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { tenant_id, email, otp } = await req.json();

  if (!tenant_id || !email || !otp) {
    return new Response("Missing fields", { status: 400 });
  }

  const { data, error } = await supabase.rpc("verify_email_otp", {
    p_tenant_id: tenant_id,
    p_email: email,
    p_plain_otp: otp,
  });

  if (error) {
    console.error(error);
    return new Response("Verification error", { status: 500 });
  }

  return new Response(JSON.stringify({ result: data[0] }), {
    headers: { "Content-Type": "application/json" },
  });
});
