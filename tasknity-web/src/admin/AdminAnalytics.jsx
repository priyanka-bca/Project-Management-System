import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function AdminAnalytics() {
  const [stats, setStats] = useState({
    groups: 0,
    members: 0,
    tasks: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    // Groups
    const { count: groupCount } = await supabase
      .from("groups")
      .select("*", { count: "exact", head: true });

    // Members
    const { count: memberCount } = await supabase
      .from("group_members")
      .select("*", { count: "exact", head: true });

    // Tasks
    const { data: tasks } = await supabase
      .from("tasks")
      .select("status, due_at");

    const today = new Date();

    const completed = tasks.filter((t) => t.status === "completed").length;
    const pending = tasks.filter(
      (t) =>
        t.status !== "completed" &&
        new Date(t.due_at) >= today
    ).length;
    const overdue = tasks.filter(
      (t) =>
        t.status !== "completed" &&
        new Date(t.due_at) < today
    ).length;

    setStats({
      groups: groupCount || 0,
      members: memberCount || 0,
      tasks: tasks.length,
      completed,
      pending,
      overdue,
    });

    setLoading(false);
  };

  if (loading) return <p className="p-6">Loading analytics...</p>;

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Admin Analytics</h1>

      {/* TOP METRICS */}
      <div className="grid md:grid-cols-3 gap-4">
        <Metric title="Total Groups" value={stats.groups} />
        <Metric title="Total Members" value={stats.members} />
        <Metric title="Total Tasks" value={stats.tasks} />
      </div>

      {/* TASK STATUS */}
      <div className="grid md:grid-cols-3 gap-4">
        <Metric title="Completed Tasks" value={stats.completed} color="green" />
        <Metric title="Pending Tasks" value={stats.pending} color="yellow" />
        <Metric title="Overdue Tasks" value={stats.overdue} color="red" />
      </div>
    </main>
  );
}

/* ---------- METRIC CARD ---------- */
function Metric({ title, value, color }) {
  const colors = {
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
    default: "bg-gray-100 text-gray-800",
  };

  return (
    <div className={`p-4 rounded shadow ${colors[color || "default"]}`}>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
