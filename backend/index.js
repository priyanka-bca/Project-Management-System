import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const app = express();
app.use(express.static('public'));

app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;


// Initialize Supabase client
const supabase = createClient(
  SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_ANON_KEY:", process.env.SUPABASE_ANON_KEY);




app.use(bodyParser.urlencoded({extended:true}));
//app.use(express.static('public')); 
// serve reset-password.html

// Helper: Get user from Authorization header
async function getUserFromAuthHeader(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabase.auth.getUser(token);
  if (error) return null;

  return data.user;
}

// signup

app.post("/signup", async (req, res) => {
  const { email, password, full_name } = req.body;

  console.log(`Signup attempt for: ${email}, Full Name: ${full_name}, Password received: ${password ? "Yes" : "No"}`); 

  try {
    // 1️⃣ Check if email already exists
    const { data: existingUser, error: existingError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (existingError && existingError.code !== 'PGRST116') { 
      // PGRST116 = no rows found, safe to ignore
      throw existingError;
    }

    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // 2️⃣ Signup
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name }
      }
    });

    if (authError || !authData?.user) {
      return res.status(400).json({ error: authError?.message || "Signup failed" });
    }

    const supabaseUserId = authData.user.id;

    // 3️⃣ Insert user into table
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert([{ id: supabaseUserId, email, full_name }])

      .select()
      .single();

    if (insertError) {
      return res.status(500).json({ error: insertError.message });
    }

    res.json({
      message: "Signup successful! Check your email for verification.",
      user: newUser,
    });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: error.message });
  }
});



// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  //console.log("Login attempt for:", email);
  //console.log("Password received:", password ? "Yes" : "No");

  try {
    // 1️⃣ Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data?.user) {
      console.log("Login error:", error);
      return res.status(401).json({ error: error?.message || "Invalid email or password" });
    }

    // 2️⃣ Fetch extra user info from users table (no password check!)
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id) // use user id instead of email+password
      .maybeSingle();

    if (profileError) {
      console.log("Profile fetch error:", profileError);
    }

  res.json({
  message: "Login successful",
  token: data.session?.access_token,
  user: {
    id: data.user.id,
    email: data.user.email,
    full_name: profile?.full_name,
     role: profile?.role || "member"
  }
});


  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// Forgot password
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  //const redirectUrl = "https://abcd1234.ngrok.io/confirm"; 

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
   redirectTo: "http://192.168.16.109:5000/reset-password.html"

  });

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "Password reset email sent!" });
});

// =======================
// TASK MANAGEMENT (LEADER)
// =======================

app.post("/tasks", async (req, res) => {
  const user = await getUserFromAuthHeader(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { title, description, deadline, member_id } = req.body;

  const { data, error } = await supabase
    .from("tasks")
    .insert([{
      title,
      description,
      deadline,
      leader_id: user.id,
      member_id
    }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  await supabase.from("notifications").insert([{
    user_id: member_id,
    message: `New task assigned: ${title}`
  }]);

  res.json(data);
});

// =======================
// LEADER TASK VIEW
// =======================

app.get("/leader/tasks", async (req, res) => {
  const user = await getUserFromAuthHeader(req);
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("leader_id", user.id);

  res.json(data);
});

// =======================
// MEMBER TASK VIEW
// =======================

app.get("/member/tasks", async (req, res) => {
  const user = await getUserFromAuthHeader(req);
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("member_id", user.id);

  res.json(data);
});

// =======================
// UPDATE PROGRESS (MEMBER)
// =======================

app.patch("/tasks/:id/progress", async (req, res) => {
  const user = await getUserFromAuthHeader(req);
  const { progress } = req.body;

  const { data } = await supabase
    .from("tasks")
    .update({
      progress,
      status: progress == 100 ? "completed" : "in_progress"
    })
    .eq("id", req.params.id)
    .eq("member_id", user.id)
    .select()
    .single();

  res.json(data);
});

// =======================
// BLOCK TASK → LEADER ALERT
// =======================

app.post("/tasks/:id/block", async (req, res) => {
  const user = await getUserFromAuthHeader(req);
  const { reason } = req.body;

  const { data: task } = await supabase
    .from("tasks")
    .select("leader_id,title")
    .eq("id", req.params.id)
    .single();

  await supabase.from("notifications").insert([{
    user_id: task.leader_id,
    message: `Task "${task.title}" blocked: ${reason}`
  }]);

  res.json({ message: "Leader notified" });
});

// =======================
// NOTIFICATIONS
// =======================

app.get("/notifications", async (req, res) => {
  const user = await getUserFromAuthHeader(req);
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  res.json(data);
});

// =======================
// REPORT EXPORT
// =======================

app.get("/leader/report", async (req, res) => {
  const user = await getUserFromAuthHeader(req);
  const { data } = await supabase
    .from("tasks")
    .select("title,status,progress,deadline")
    .eq("leader_id", user.id);

  res.json({
    generated_at: new Date(),
    total_tasks: data.length,
    tasks: data
  });
});

app.listen(PORT, () =>
  console.log(`🚀 API running on port ${PORT}`)
);
