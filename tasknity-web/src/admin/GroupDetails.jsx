import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabase";
import TaskList from "./TaskList";

export default function GroupDetails() {
  const { groupId } = useParams();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  /* TASK MODAL */
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskUser, setTaskUser] = useState(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    loadGroup();
    loadMembers();
    loadTasks();
  }, [groupId]);

  /* ---------------- LOAD DATA ---------------- */
  const loadGroup = async () => {
    const { data } = await supabase
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .single();

    setGroup(data);
    setLoading(false);
  };

  const loadMembers = async () => {
    const { data } = await supabase
      .from("group_members")
      .select(`id, profiles ( id, name )`)
      .eq("group_id", groupId);

    setMembers(data || []);
  };

  const loadTasks = async () => {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("group_id", groupId);

    setTasks(data || []);
  };

  /* ---------------- TASK FILTERS ---------------- */
  const completedTasks = tasks.filter((t) => t.status === "completed");
  const pendingTasks = tasks.filter((t) => t.status === "pending");

  /* ---------------- ADD TASK ---------------- */
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskUser) return;

    await supabase.from("tasks").insert({
      title,
      description: desc,
      due_date: dueDate,
      group_id: groupId,
      assigned_to: taskUser.id,
      status: "pending",
    });

    setTitle("");
    setDesc("");
    setDueDate("");
    setTaskUser(null);
    setShowTaskModal(false);

    loadTasks(); // refresh tasks
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading…
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-100">
      {/* HEADER */}
      <header className="bg-white rounded-2xl border shadow-sm p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">{group.name}</h1>
          <p className="mt-1 text-sm text-slate-500">Group dashboard overview</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
            {group.project_name}
          </span>
          <span className="text-sm text-slate-500">Members: {members.length}</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 space-y-10">

        {/* STATS */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard label="Total Tasks" value={tasks.length} color="blue" />
          <StatCard label="Pending" value={pendingTasks.length} color="yellow" />
          <StatCard label="Completed" value={completedTasks.length} color="green" />
        </section>

        {/* MEMBERS */}
        <section className="bg-white rounded-2xl border shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-slate-800">Members</h2>
            <span className="text-sm text-slate-400">{members.length} total</span>
          </div>

          {members.length === 0 ? (
            <EmptyState text="No members added yet" />
          ) : (
            <ul className="divide-y">
              {members.map((m) => (
                <li key={m.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={m.profiles.name} />
                    <span className="text-slate-700">{m.profiles.name}</span>
                  </div>

                  <button
                    onClick={() => {
                      setTaskUser(m.profiles);
                      setShowTaskModal(true);
                    }}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    + Assign Task
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* TASKS */}
        <section className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="text-lg font-medium text-slate-800 mb-4">Tasks</h2>
          <TaskList groupId={groupId} />
        </section>
      </main>

      {/* TASK MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setShowTaskModal(false)} />
          <form
            onSubmit={handleAddTask}
            className="relative z-10 w-full max-w-md rounded-2xl bg-white p-8 shadow-xl space-y-5"
          >
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Assign Task</h3>
              <p className="text-sm text-slate-500">To {taskUser.name}</p>
            </div>

            <input
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              required
            />

            <textarea
              placeholder="Description"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            />

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              required
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowTaskModal(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Save Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function StatCard({ label, value, color }) {
  const colors = {
    blue: "bg-blue-100 text-blue-700",
    yellow: "bg-yellow-100 text-yellow-700",
    green: "bg-green-100 text-green-700",
  };

  return (
    <div className={`rounded-2xl p-6 ${colors[color]} shadow-sm`}>
      <p className="text-sm">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function Avatar({ name }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
  return (
    <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold">
      {initials}
    </div>
  );
}

function EmptyState({ text }) {
  return <div className="py-16 text-center text-slate-500">{text}</div>;
}
