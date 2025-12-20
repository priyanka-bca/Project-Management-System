import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function TaskList({ groupId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, [groupId]);

  const loadTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select(`
        id,
        title,
        issued_at,
        due_date,
        status,
        profiles (
          name
        )
      `)
      .eq("group_id", groupId)
      .order("issued_at", { ascending: false });

    if (!error) setTasks(data || []);
    setLoading(false);
  };

  if (loading) return <p className="text-gray-500">Loading tasks...</p>;

  if (tasks.length === 0) {
    return <p className="text-gray-500">No tasks created yet.</p>;
  }

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-100 text-left">
          <th className="p-2 border">Title</th>
          <th className="p-2 border">Assigned To</th>
          <th className="p-2 border">Issued At</th>
          <th className="p-2 border">Due Date</th>
          <th className="p-2 border">Status</th>
        </tr>
      </thead>

      <tbody>
        {tasks.map((task) => (
          <tr key={task.id}>
            <td className="p-2 border">{task.title}</td>
            <td className="p-2 border">{task.profiles?.name}</td>
            <td className="p-2 border">
              {new Date(task.issued_at).toLocaleDateString()}
            </td>
            <td className="p-2 border">
              {new Date(task.due_date).toLocaleDateString()}
            </td>
            <td className="p-2 border capitalize">{task.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
  