import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper: Get user from Authorization header
async function getUserFromAuthHeader(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabase.auth.getUser(token);
  if (error) return null;

  return data.user;
}

// ---------------------
// AUTH ROUTES
// ---------------------

// Signup
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  // Check if user already exists in users table
  const { data: existingUser } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (existingUser) {
    return res.status(400).json({ error: "Email already registered" });
  }

  // Signup with Supabase Auth
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return res.status(400).json({ error: error.message });

  // Insert user into your users table
  const { data: newUser, error: insertError } = await supabase
    .from("users")
    .insert([{ email }])
    .select()
    .single();

  if (insertError) return res.status(500).json({ error: insertError.message });

  res.json({ message: "Signup successful! Check your email to verify.", user: newUser });
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists in your users table
  const { data: userExists, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (userError || !userExists) {
    return res.status(401).json({ error: "Invalid email or not registered" });
  }

  // Attempt Supabase auth login
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: "Invalid password" });

  res.json({
    message: "Login successful",
    token: data.session.access_token,
    user: data.user
  });
});

// Forgot password
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "http://localhost:5000/reset-password"
  });

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "Password reset email sent!" });
});

// ---------------------
// GROUP ROUTES
// ---------------------

app.get("/groups", async (req, res) => {
  const user = await getUserFromAuthHeader(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { data, error } = await supabase
    .from("groups")
    .select("*, tasks(*)")
    .eq("owner", user.id);

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

app.post("/groups", async (req, res) => {
  const user = await getUserFromAuthHeader(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { name, description } = req.body;
  const { data, error } = await supabase
    .from("groups")
    .insert([{ name, description, owner: user.id }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

// ---------------------
// TASK ROUTES
// ---------------------

app.post("/groups/:groupId/tasks", async (req, res) => {
  const user = await getUserFromAuthHeader(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { groupId } = req.params;
  const { title, status } = req.body;

  const { data: group } = await supabase.from("groups").select("*").eq("id", groupId).single();
  if (!group) return res.status(404).json({ error: "Group not found" });
  if (group.owner !== user.id) return res.status(403).json({ error: "Forbidden" });

  const { data, error } = await supabase
    .from("tasks")
    .insert([{ group_id: Number(groupId), title, status: status || "Pending" }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

app.patch("/tasks/:taskId", async (req, res) => {
  const user = await getUserFromAuthHeader(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { taskId } = req.params;
  const { status } = req.body;

  const { data, error } = await supabase.from("tasks").update({ status }).eq("id", taskId).select().single();
  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

// ---------------------
app.listen(PORT, () => console.log(`🚀 API running on port ${PORT}`));
 