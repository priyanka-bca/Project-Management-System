import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function MemberDashboard() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadMemberTasks();
  }, []);

  const loadMemberTasks = async () => {
    setLoading(true);

    // 1️⃣ Get logged-in user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setUser(user);

    // 2️⃣ Fetch tasks assigned to this member
    const { data, error } = await supabase
      .from("tasks")
      .select(`
        id,
        title,
        description,
        issued_at,
        due_date,
        status,
        groups (
          name,
          project_name
        )
      `)
      .eq("assigned_to", user.id)
      .order("due_date", { ascending: true });

    if (!error) {
      setTasks(data || []);
    }

    setLoading(false);
  };

  if (loading) {
    return <p className="p-6 text-gray-600">Loading your tasks...</p>;
  }

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        Member Dashboard
      </h1>

      {tasks.length === 0 ? (
        <p className="text-gray-600">
          No tasks assigned to you yet.
        </p>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white border rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-lg">
                  {task.title}
                </h2>
                <span
                  className={`px-2 py-1 text-sm rounded ${
                    task.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {task.status}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-2">
                {task.description || "No description"}
              </p>

              <div className="text-sm text-gray-500 grid grid-cols-2 gap-2">
                <p>
                  <strong>Group:</strong> {task.groups?.name}
                </p>
                <p>
                  <strong>Project:</strong> {task.groups?.project_name}
                </p>
                <p>
                  <strong>Issued:</strong> {task.issued_at}
                </p>
                <p>
                  <strong>Due:</strong> {task.due_date}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
