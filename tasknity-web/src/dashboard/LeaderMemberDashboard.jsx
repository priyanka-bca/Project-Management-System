import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function LeaderMemberDashboard() {
  const [tasks, setTasks] = useState([]);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderData();
  }, []);

  const loadLeaderData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: membership } = await supabase
        .from("group_members")
        .select(`
          group_id,
          groups ( id, name )
        `)
        .eq("user_id", user.id)
        .eq("role", "leader")
        .single();

      if (!membership) return;

      setGroup(membership.groups);

      const { data } = await supabase
        .from("tasks")
        .select(`
          id,
          title,
          status,
          issued_at,
          due_date,
          profiles ( name )
        `)
        .eq("group_id", membership.group_id)
        .order("due_date");

      setTasks(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (taskId, status) => {
    await supabase.from("tasks").update({ status }).eq("id", taskId);

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
  };

  const statusStyle = {
    pending: "bg-yellow-100 text-yellow-700",
    in_progress: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
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
    <main className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-xl p-6">
        <h1 className="text-2xl font-bold">
          Leader Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Group: <span className="font-medium">{group.name}</span>
        </p>
      </div>

      {/* Tasks */}
      <div className="bg-white shadow rounded-xl overflow-x-auto">
        {tasks.length === 0 ? (
          <p className="p-6 text-gray-500 text-center">
            No tasks assigned yet.
          </p>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3 text-left">Task</th>
                <th className="p-3 text-left">Assigned To</th>
                <th className="p-3">Issued</th>
                <th className="p-3">Due</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {tasks.map((task) => (
                <tr
                  key={task.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-3 font-medium">
                    {task.title}
                  </td>

                  <td className="p-3">
                    {task.profiles?.name || "—"}
                  </td>

                  <td className="p-3 text-center">
                    {new Date(task.issued_at).toLocaleDateString()}
                  </td>

                  <td className="p-3 text-center">
                    {new Date(task.due_date).toLocaleDateString()}
                  </td>

                  <td className="p-3 text-center">
                    <select
                      value={task.status}
                      onChange={(e) =>
                        updateStatus(task.id, e.target.value)
                      }
                      className={`px-3 py-1 rounded-full text-xs font-semibold border outline-none ${statusStyle[task.status]}`}
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
      </div>
    </main>
  );
}
