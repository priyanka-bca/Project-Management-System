import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function TaskList({ groupId, tasks: externalTasks }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (externalTasks && externalTasks.length > 0) {
      // Use externally provided tasks (from filtering)
      setTasks(externalTasks);
      setLoading(false);
    } else if (groupId) {
      // Load tasks from database if not provided externally
      loadTasks();
    }
  }, [groupId, externalTasks]);

  const loadTasks = async () => {
    if (!groupId) return;
    
    const { data: tasksData, error } = await supabase
      .from("tasks")
      .select(`
        id,
        title,
        issued_at,
        due_date,
        status,
        document_submitted,
        assigned_to
      `)
      .eq("group_id", groupId)
      .order("issued_at", { ascending: false });

    if (error) {
      console.error("Error loading tasks:", error);
      setLoading(false);
      return;
    }

    // Now fetch profile info for assigned_to users
    if (tasksData && tasksData.length > 0) {
      const userIds = [...new Set(tasksData.map(t => t.assigned_to).filter(Boolean))];
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);

        const profileMap = {};
        profiles?.forEach(p => {
          profileMap[p.id] = p.full_name;
        });

        // Merge profile data into tasks
        const enrichedTasks = tasksData.map(task => ({
          ...task,
          profiles: task.assigned_to ? { full_name: profileMap[task.assigned_to] } : null
        }));

        setTasks(enrichedTasks);
      } else {
        setTasks(tasksData);
      }
    } else {
      setTasks(tasksData || []);
    }

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

  const getDueDateColor = (task) => {
    if (!task.due_date) return "text-slate-500";
    
    const dueDate = new Date(task.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    if (dueDate < today && task.status !== "completed") {
      return "text-red-600 font-semibold"; // Overdue - red
    }
    return "text-slate-600";
  };

  const isOverdue = (task) => {
    if (!task.due_date) return false;
    
    const dueDate = new Date(task.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate < today && task.status !== "completed";
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
            <tr key={task.id} className={`hover:bg-slate-50 ${isOverdue(task) ? "bg-red-50" : ""}`}>
              <td className="p-3 border text-slate-800">{task.title}</td>
              <td className="p-3 border text-slate-600">{task.profiles?.full_name || "Unassigned"}</td>
              <td className="p-3 border text-slate-600">
                {new Date(task.issued_at).toLocaleDateString()}
              </td>
              <td className={`p-3 border ${getDueDateColor(task)}`}>
                <div className="flex items-center gap-2">
                  {new Date(task.due_date).toLocaleDateString()}
                  {isOverdue(task) && (
                    <span className="inline-block px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded">
                      Overdue
                    </span>
                  )}
                </div>
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
  