// index.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Load from .env file
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const PORT = process.env.PORT || 5000;

// ✅ Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// --- Helper function to verify user token ---
async function getUserFromAuthHeader(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error) return null;
    return data.user; // { id, email, ... }
  } catch (err) {
    return null;
  }
}

// --- ROUTES ---

// GET /groups  → Fetch groups for logged-in user
app.get('/groups', async (req, res) => {
  const user = await getUserFromAuthHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { data, error } = await supabase
    .from('groups')
    .select('*, tasks(*)')
    .eq('owner', user.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /groups  → Create new group
app.post('/groups', async (req, res) => {
  const user = await getUserFromAuthHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });

  const { data, error } = await supabase
    .from('groups')
    .insert([{ name, description, owner: user.id }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /groups/:groupId/tasks  → Add task to a group
app.post('/groups/:groupId/tasks', async (req, res) => {
  const user = await getUserFromAuthHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { groupId } = req.params;
  const { title, status } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });

  const { data: group, error: gErr } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single();

  if (gErr || !group) return res.status(404).json({ error: 'Group not found' });
  if (group.owner !== user.id) return res.status(403).json({ error: 'Forbidden' });

  const { data, error } = await supabase
    .from('tasks')
    .insert([{ group_id: Number(groupId), title, status: status || 'Pending' }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PATCH /tasks/:taskId  → Update task status
app.patch('/tasks/:taskId', async (req, res) => {
  const user = await getUserFromAuthHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { taskId } = req.params;
  const { status } = req.body;

  const { data, error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ✅ Start server
app.listen(PORT, () => console.log(`🚀 API running on http://localhost:${PORT}`));
