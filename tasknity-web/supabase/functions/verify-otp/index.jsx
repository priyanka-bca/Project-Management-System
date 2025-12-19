serve(async (req) => {
  const { email, otp } = await req.json();

  const supabase = createClient(
    Deno.env.get("https://zsangtjxipvxbwmdmzoy.supabase.co")!,
    Deno.env.get("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzYW5ndGp4aXB2eGJ3bWRtem95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2ODk4NjEsImV4cCI6MjA4MDI2NTg2MX0.Au7p0GmMwbraGu9LjhIejff76boX-WLs7j-VtwUk0Mw")!
  );

  const { data } = await supabase
    .from("email_otps")
    .select("*")
    .eq("email", email)
    .eq("otp", otp)
    .eq("used", false)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (!data) {
    return new Response("Invalid OTP", { status: 401 });
  }

  await supabase
    .from("email_otps")
    .update({ used: true })
    .eq("id", data.id);

  // 🔐 Create user session manually
  const { data: user } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
  });

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
