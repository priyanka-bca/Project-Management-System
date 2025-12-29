import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function Reports() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const { data } = await supabase
      .from("tasks")
      .select(`
        id,
        title,
        status,
        due_at,
        profiles ( name )
      `)
      .order("due_at", { ascending: true });

    setTasks(data || []);
    setLoading(false);
  };

  const today = new Date();

  const completed = tasks.filter(t => t.status === "completed");
  const pending = tasks.filter(
    t => t.status !== "completed" && new Date(t.due_at) >= today
  );
  const overdue = tasks.filter(
    t => t.status !== "completed" && new Date(t.due_at) < today
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading…
      </div>
    );
  }

  return (
    /* STRONG BACKGROUND */
    <div className="min-h-screen bg-gray-900 p-8">
      <main className="max-w-7xl mx-auto">
        
        {/* BIG CARD CONTAINER */}
        <div className="relative bg-white rounded-xl shadow-2xl border-4 border-indigo-600">

          {/* ACCENT BAR */}
          <div className="absolute top-0 left-0 h-full w-2 bg-indigo-600 rounded-l-xl" />

          <div className="p-8 space-y-10">

            {/* HEADER */}
            <header className="flex justify-between items-center border-b pb-4">
              <h1 className="text-3xl font-extrabold text-gray-800">
                TASK REPORTS
              </h1>
              <span className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold">
                TOTAL {tasks.length}
              </span>
            </header>

            {/* SUMMARY */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SummaryCard title="Completed" count={completed.length} color="green" />
              <SummaryCard title="Pending" count={pending.length} color="yellow" />
              <SummaryCard title="Overdue" count={overdue.length} color="red" />
            </section>

            {/* TABLE BLOCK */}
            <section className="border-2 rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-6 py-3 font-bold">
                ALL TASKS
              </div>

              <table className="w-full">
                <thead className="bg-gray-200 text-sm">
                  <tr>
                    <th className="p-3 text-left">Task</th>
                    <th className="p-3 text-left">Assigned</th>
                    <th className="p-3 text-left">Due</th>
                    <th className="p-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(t => (
                    <tr
                      key={t.id}
                      className="border-t hover:bg-indigo-50"
                    >
                      <td className="p-3 font-semibold">{t.title}</td>
                      <td className="p-3">{t.profiles?.name || "—"}</td>
                      <td className="p-3">{formatDate(t.due_at)}</td>
                      <td className="p-3">
                        <StatusBadge status={t.status} due_at={t.due_at} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}

/* SUMMARY CARD */
function SummaryCard({ title, count, color }) {
  const colors = {
    green: "border-green-500 text-green-700",
    yellow: "border-yellow-500 text-yellow-700",
    red: "border-red-500 text-red-700",
  };

  return (
    <div className={`border-4 rounded-lg p-6 ${colors[color]} bg-white`}>
      <p className="font-bold uppercase text-sm">{title}</p>
      <p className="text-4xl font-extrabold mt-2">{count}</p>
    </div>
  );
}

/* STATUS BADGE */
function StatusBadge({ status, due_at }) {
  const overdue =
    status !== "completed" && new Date(due_at) < new Date();

  if (status === "completed")
    return <span className="font-bold text-green-600">COMPLETED</span>;

  if (overdue)
    return <span className="font-bold text-red-600">OVERDUE</span>;

  return <span className="font-bold text-yellow-600">PENDING</span>;
}

/* DATE FORMAT */
function formatDate(date) {
  return new Date(date).toLocaleDateString();
}
