import { serve } from "deno";
import nodemailer from "npm:nodemailer@6.9.3";
import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const transporter = nodemailer.createTransport({
  host: Deno.env.get("SMTP_HOST")!,
  port: Number(Deno.env.get("SMTP_PORT")!),
  secure: Number(Deno.env.get("SMTP_PORT")) === 465,
  auth: {
    user: Deno.env.get("SMTP_USER")!,
    pass: Deno.env.get("SMTP_PASS")!,
  },
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { tenant_id, email, ttl_minutes = 5 } = await req.json();

  if (!tenant_id || !email) {
    return new Response("Missing fields", { status: 400 });
  }

  const otp = generateOTP();

  const { error } = await supabase.rpc("create_email_otp", {
    p_tenant_id: tenant_id,
    p_email: email,
    p_plain_otp: otp,
    p_ttl: `${ttl_minutes} minutes`,
  });

  if (error) {
    console.error(error);
    return new Response("DB error", { status: 500 });
  }

  await transporter.sendMail({
    from: Deno.env.get("FROM_EMAIL")!,
    to: email,
    subject: "Your OTP Code",
    html: `<h2>${otp}</h2><p>Valid for ${ttl_minutes} minutes</p>`,
  });

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
