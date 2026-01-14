import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface RequestBody {
  email: string;
  newPassword: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    const { email, newPassword } = (await req.json()) as RequestBody;

    if (!email || !newPassword) {
      return new Response(
        JSON.stringify({ error: "Missing email or password" }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration missing" }),
        { status: 500, headers: corsHeaders }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find user by email using listUsers
    const { data, error: listError } = await supabase.auth.admin.listUsers();

    if (listError || !data) {
      console.error("listUsers error:", listError);
      return new Response(
        JSON.stringify({ error: "Failed to query users" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // data should be an array of users
    const userList = Array.isArray(data) ? data : (data.users || []);
    const user = userList.find((u: any) => u.email === email);
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: corsHeaders }
      );
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Create profile if it doesn't exist
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          email: user.email,
          role: 'member',
        },
        { onConflict: 'id' }
      );

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Don't fail - password was already updated
    }

    return new Response(
      JSON.stringify({ success: true, message: "Password updated" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: corsHeaders }
    );
  }
});
