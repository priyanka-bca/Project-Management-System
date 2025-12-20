import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { motion } from "framer-motion";

export default function MemberDashboard() {
  const [tasks, setTasks] = useState([]);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMemberData();
  }, []);

  const loadMemberData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: memberRow } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", user.id)
      .single();

    if (!memberRow) {
      setLoading(false);
      return;
    }

    const { data: groupData } = await supabase
      .from("groups")
      .select("*")
      .eq("id", memberRow.group_id)
      .single();

    const { data: taskData } = await supabase
      .from("tasks")
      .select("*")
      .eq("assigned_to", user.id)
      .order("due_date", { ascending: true });

    setGroup(groupData);
    setTasks(taskData || []);
    setLoading(false);
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading your workspace...</p>
      </div>
    );

  if (!group)
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">
          You are not assigned to any project yet.
        </p>
      </div>
    );

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto p-8 space-y-8"
    >
      {/* HEADER */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-800">
          My Workspace
        </h1>
        <p className="text-gray-500">
          Track your assigned tasks and deadlines
        </p>
      </div>

      {/* PROJECT CARD */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-xl p-6 shadow-lg">
        <p className="text-sm uppercase opacity-80">Project</p>
        <h2 className="text-2xl font-semibold">{group.project_name}</h2>
        <p className="mt-1 text-sm opacity-90">
          Group: {group.name}
        </p>
      </div>

      {/* TASKS */}
      <div className="bg-white rounded-xl shadow border">
        <div className="p-5 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            Assigned Tasks
          </h3>
        </div>

        {tasks.length === 0 ? (
          <p className="p-6 text-gray-500">
            No tasks assigned yet.
          </p>
        ) : (
          <div className="divide-y">
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                whileHover={{ scale: 1.01 }}
                className="p-5 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {task.title}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Issued:{" "}
                    {new Date(task.issued_at).toLocaleDateString()} •
                    Due:{" "}
                    {new Date(task.due_date).toLocaleDateString()}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    task.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {task.status}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.main>
  );
}
