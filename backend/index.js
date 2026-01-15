import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// =======================
// SUPABASE
// =======================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// =======================
// AUTH HELPER
// =======================
async function getUserFromAuthHeader(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const token = authHeader.split(" ")[1];
  if (!token) return null;

  const { data, error } = await supabase.auth.getUser(token);
  if (error) return null;

  return data.user;
}

// =======================
// SIGNUP
// =======================
app.post("/signup", async (req, res) => {
  const { email, password, fullName, role } = req.body;

  try {
    console.log(`[SIGNUP] Attempting to create user: ${email}`);
    
    // Create user with regular signup (for development, email verification is optional)
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      console.error("[SIGNUP] Auth error:", error);
      return res.status(400).json({ message: error.message });
    }

    console.log(`[SIGNUP] User created: ${data.user.id}`);

    // Create profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      full_name: fullName || email.split("@")[0],
      email: email,
      role: role || "member",
    });

    if (profileError) {
      console.error("[SIGNUP] Profile error:", profileError);
    } else {
      console.log(`[SIGNUP] Profile created for: ${email}`);
    }

    res.json({ 
      message: "Signup successful",
      user: {
        id: data.user.id,
        email: data.user.email,
      }
    });
  } catch (err) {
    console.error("[SIGNUP] Exception:", err);
    res.status(500).json({ message: err.message });
  }
});

// =======================
// CONFIRM EMAIL (Development only - bypass email verification)
// =======================
app.post("/confirm-email", async (req, res) => {
  const { userId } = req.body;

  try {
    console.log(`[CONFIRM EMAIL] Confirming user: ${userId}`);

    // Use admin API to update user and mark email as confirmed
    const { data, error } = await supabase.auth.admin.updateUserById(
      userId,
      { 
        email_confirm: true 
      }
    );

    if (error) {
      console.error("[CONFIRM EMAIL] Admin API error:", error);
      console.log("[CONFIRM EMAIL] Trying direct SQL update instead...");
      
      // Fallback: Update auth.users table directly using service role
      const { error: sqlError } = await supabase.rpc('update_user_email_confirmed', {
        user_id: userId
      }).single();
      
      if (sqlError) {
        console.error("[CONFIRM EMAIL] SQL error:", sqlError);
        // Even if both fail, continue - user can try again
        return res.status(400).json({ message: "Unable to confirm email, but profile created" });
      }
    }

    console.log(`[CONFIRM EMAIL] User confirmed: ${userId}`);
    res.json({ message: "Email confirmed successfully" });
  } catch (err) {
    console.error("[CONFIRM EMAIL] Exception:", err.message);
    // Don't fail - continue anyway
    res.json({ message: "Profile created, email confirmation skipped for development" });
  }
});

// =======================
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(401).json({ message: error.message });
  }

  res.json({
    token: data.session.access_token,
    user: data.user,
  });
});

// =======================
// CREATE TASK (MEMBER)
// =======================
app.post("/member/tasks", async (req, res) => {
  const user = await getUserFromAuthHeader(req);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title,
      description,
      member_id: user.id,
      status: "pending",
      progress: 0,
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  res.status(201).json({
    message: "Task created successfully",
    task: data,
  });
});

// =======================
// GET MEMBER TASKS
// =======================
app.get("/member/tasks", async (req, res) => {
  const user = await getUserFromAuthHeader(req);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("member_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  res.json(data);
});

// =======================
// UPDATE TASK PROGRESS
// =======================
app.patch("/tasks/:id/progress", async (req, res) => {
  const user = await getUserFromAuthHeader(req);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { progress } = req.body;

  const { data, error } = await supabase
    .from("tasks")
    .update({
      progress,
      status: progress === 100 ? "completed" : "in_progress",
    })
    .eq("id", req.params.id)
    .eq("member_id", user.id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  res.json(data);
});

// =======================
// DELETE TASK (MEMBER)
// =======================
app.delete("/tasks/:id", async (req, res) => {
  const user = await getUserFromAuthHeader(req);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", req.params.id)
    .eq("member_id", user.id);

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  res.json({ message: "Task deleted successfully" });
});

// =======================
// ASSIGN TASK (LEADER)
// =======================
app.post("/tasks", async (req, res) => {
  const user = await getUserFromAuthHeader(req);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { title, description, member_id, deadline } = req.body;

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title,
      description,
      member_id,
      leader_id: user.id,
      deadline,
      status: "pending",
      progress: 0,
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  res.json(data);
});

// =======================
// SERVER
// =======================
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
