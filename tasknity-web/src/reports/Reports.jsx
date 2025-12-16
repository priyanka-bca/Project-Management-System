import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function Reports() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select(`
        id,
        title,
        status,
        due_at,
        profiles ( name )
      `);

    if (!error) setTasks(data || []);
    setLoading(false);
  };

  const today = new Date();

  const completed = tasks.filter((t) => t.status === "completed");
  const pending = tasks.filter(
    (t) =>
      t.status !== "completed" &&
      new Date(t.due_at) >= today
  );
  const overdue = tasks.filter(
    (t) =>
      t.status !== "completed" &&
      new Date(t.due_at) < today
  );

  if (loading) return <p className="p-6">Loading reports...</p>;

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Task Reports</h1>

      {/* SUMMARY */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard title="Completed" count={completed.length} color="green" />
        <SummaryCard title="Pending" count={pending.length} color="yellow" />
        <SummaryCard title="Overdue" count={overdue.length} color="red" />
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded shadow p-4">
        <h2 className="font-semibold mb-4">All Tasks</h2>

        {tasks.length === 0 ? (
          <p className="text-gray-500">No tasks found.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Task</th>
                <th className="text-left p-2">Assigned To</th>
                <th className="text-left p-2">Due Date</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>

            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} className="border-b">
                  <td className="p-2">{t.title}</td>
                  <td className="p-2">
                    {t.profiles?.name || "—"}
                  </td>
                  <td className="p-2">{t.due_at}</td>
                  <td className="p-2 capitalize">{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}

/* -------- SUMMARY CARD -------- */
function SummaryCard({ title, count, color }) {
  const colors = {
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <div className={`p-4 rounded shadow ${colors[color]}`}>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold">{count}</p>
    </div>
  );
}
