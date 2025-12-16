import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function LeaderMemberDashboard() {
  const [tasks, setTasks] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileAndTasks();
  }, []);

  const loadProfileAndTasks = async () => {
    // 1️⃣ Get logged-in user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // 2️⃣ Get profile (role, name)
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setProfile(profileData);

    // 3️⃣ Load tasks based on role
    if (profileData.role === "leader") {
      loadLeaderTasks(user.id);
    } else {
      loadMemberTasks(user.id);
    }

    setLoading(false);
  };

  /* -------- LEADER TASKS -------- */
  const loadLeaderTasks = async (leaderId) => {
    const { data } = await supabase
      .from("tasks")
      .select(`
        id,
        title,
        issued_at,
        due_at,
        status,
        profiles ( name )
      `);

    setTasks(data || []);
  };

  /* -------- MEMBER TASKS -------- */
  const loadMemberTasks = async (userId) => {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("assigned_to", userId);

    setTasks(data || []);
  };

  /* -------- UPDATE STATUS (LEADER) -------- */
  const updateStatus = async (taskId, status) => {
    await supabase
      .from("tasks")
      .update({ status })
      .eq("id", taskId);

    loadProfileAndTasks();
  };

  if (loading) return <p className="p-6">Loading dashboard...</p>;

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        {profile.role === "leader" ? "Leader Dashboard" : "Member Dashboard"}
      </h1>

      <p className="text-gray-600">
        Welcome, <span className="font-medium">{profile.name}</span>
      </p>

      {/* TASK LIST */}
      <div className="bg-white border rounded shadow p-4">
        {tasks.length === 0 ? (
          <p className="text-gray-500">No tasks assigned.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Task</th>
                <th className="text-left p-2">Issued</th>
                <th className="text-left p-2">Due</th>
                <th className="text-left p-2">Status</th>
                {profile.role === "leader" && (
                  <th className="text-left p-2">Action</th>
                )}
              </tr>
            </thead>

            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} className="border-b">
                  <td className="p-2">{t.title}</td>
                  <td className="p-2">{t.issued_at}</td>
                  <td className="p-2">{t.due_at}</td>
                  <td className="p-2 capitalize">{t.status}</td>

                  {profile.role === "leader" && (
                    <td className="p-2">
                      <select
                        value={t.status}
                        onChange={(e) =>
                          updateStatus(t.id, e.target.value)
                        }
                        className="border p-1 rounded"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
