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
        document_submitted,
        profiles (
          name
        )
      `)
      .eq("group_id", groupId)
      .order("issued_at", { ascending: false });

    if (!error) setTasks(data || []);
    setLoading(false);
  };

  const getTaskStatus = (task) => {
    if (task.status === "completed") return "completed";
    
    const dueDate = new Date(task.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    if (dueDate < today && task.status !== "completed") {
      return "expired";
    }
    
    return "pending";
  };

  const getStatusBadge = (task) => {
    const status = getTaskStatus(task);
    
    const statusConfig = {
      completed: { text: "✓ Completed", color: "bg-green-100 text-green-800" },
      expired: { text: "⚠️ Expired", color: "bg-red-100 text-red-800" },
      pending: { text: "⏳ Pending", color: "bg-yellow-100 text-yellow-800" }
    };
    
    const config = statusConfig[status];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const hasSubmittedDocument = (task) => {
    return task.document_submitted ? "✓ Yes" : "✗ No";
  };

  if (loading) return <p className="text-gray-500">Loading tasks...</p>;

  if (tasks.length === 0) {
    return <p className="text-gray-500">No tasks created yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-100 text-left">
            <th className="p-3 border text-slate-700 font-semibold">Title</th>
            <th className="p-3 border text-slate-700 font-semibold">Assigned To</th>
            <th className="p-3 border text-slate-700 font-semibold">Issued At</th>
            <th className="p-3 border text-slate-700 font-semibold">Due Date</th>
            <th className="p-3 border text-slate-700 font-semibold">Status</th>
            <th className="p-3 border text-slate-700 font-semibold">Document</th>
          </tr>
        </thead>

        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="hover:bg-slate-50">
              <td className="p-3 border text-slate-800">{task.title}</td>
              <td className="p-3 border text-slate-600">{task.profiles?.name || "Unassigned"}</td>
              <td className="p-3 border text-slate-600">
                {new Date(task.issued_at).toLocaleDateString()}
              </td>
              <td className="p-3 border text-slate-600">
                {new Date(task.due_date).toLocaleDateString()}
              </td>
              <td className="p-3 border">
                {getStatusBadge(task)}
              </td>
              <td className="p-3 border text-center text-slate-600">
                {hasSubmittedDocument(task)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
  