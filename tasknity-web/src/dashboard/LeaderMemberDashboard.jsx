import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function LeaderMemberDashboard() {
  const [tasks, setTasks] = useState([]);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderData();
  }, []);

  // Load leader group and related tasks
  const loadLeaderData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // 1️⃣ Get leader's group
      const { data: membership } = await supabase
        .from("group_members")
        .select(`
          group_id,
          groups (
            id,
            name
          )
        `)
        .eq("user_id", user.id)
        .eq("role", "leader")
        .single();

      if (!membership) {
        setLoading(false);
        return;
      }

      setGroup(membership.groups);

      // 2️⃣ Load tasks of the group
      const { data: tasksData } = await supabase
        .from("tasks")
        .select(`
          id,
          title,
          status,
          issued_at,
          due_date,
          profiles (
            name
          )
        `)
        .eq("group_id", membership.group_id)
        .order("due_date", { ascending: true });

      setTasks(tasksData || []);
    } catch (error) {
      console.error("Error loading leader data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update task status
  const updateStatus = async (taskId, status) => {
    await supabase
      .from("tasks")
      .update({ status })
      .eq("id", taskId);

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status } : task
      )
    );
  };

  if (loading) return <p className="p-6">Loading...</p>;

  if (!group) {
    return (
      <p className="p-6 text-gray-500">
        You are not assigned as a leader.
      </p>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        Leader Dashboard — {group.name}
      </h1>

      {tasks.length === 0 ? (
        <p className="text-gray-500">No tasks yet.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Task</th>
              <th className="p-2 border">Assigned To</th>
              <th className="p-2 border">Issued</th>
              <th className="p-2 border">Due</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>

          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td className="p-2 border">{task.title}</td>
                <td className="p-2 border">
                  {task.profiles?.name || "—"}
                </td>
                <td className="p-2 border">
                  {new Date(task.issued_at).toLocaleDateString()}
                </td>
                <td className="p-2 border">
                  {new Date(task.due_date).toLocaleDateString()}
                </td>
                <td className="p-2 border">
                  <select
                    value={task.status}
                    onChange={(e) =>
                      updateStatus(task.id, e.target.value)
                    }
                    className="border rounded p-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
