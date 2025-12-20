import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TaskList from "./TaskList";
import { supabase } from "../supabase";

export default function GroupDetails() {
  const { groupId } = useParams();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Task modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskUser, setTaskUser] = useState(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [dueDate, setDueDate] = useState("");

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    loadGroup();
    loadMembers();
  }, [groupId]);

  const loadGroup = async () => {
    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .single();

    if (!error) setGroup(data);
    setLoading(false);
  };

  const loadMembers = async () => {
    const { data } = await supabase
      .from("group_members")
      .select(`
        id,
        profiles (
          id,
          name
        )
      `)
      .eq("group_id", groupId);

    setMembers(data || []);
  };

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

    // reset
    setTitle("");
    setDesc("");
    setDueDate("");
    setTaskUser(null);
    setShowTaskModal(false);
  };

  /* ---------------- UI ---------------- */

  if (loading) return <p className="p-6">Loading...</p>;
  if (!group) return <p className="p-6 text-red-600">Group not found</p>;

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Group Details</h1>

      {/* GROUP INFO */}
      <div className="bg-white p-4 border rounded shadow">
        <p className="text-lg font-semibold">
          Group: <span className="text-blue-600">{group.name}</span>
        </p>
        <p className="text-gray-600">
          Project: {group.project_name}
        </p>
      </div>

      {/* MEMBERS */}
      <div className="bg-white p-4 border rounded shadow">
        <h2 className="font-semibold mb-3">Members</h2>

        {members.length === 0 ? (
          <p className="text-gray-500">No members added yet.</p>
        ) : (
          <ul className="space-y-2">
            {members.map((m) => (
              <li
                key={m.id}
                className="border p-2 rounded flex justify-between items-center"
              >
                <span>{m.profiles.name}</span>

                <button
                  onClick={() => {
                    setTaskUser(m.profiles);
                    setShowTaskModal(true);
                  }}
                  className="text-blue-600 hover:underline"
                >
                  ➕ Add Task
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* TASK LIST */}
      <div className="bg-white p-4 border rounded shadow">
        <h2 className="font-semibold mb-3">Tasks</h2>

        <TaskList groupId={groupId} />
      </div>


      {/* TASK MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <form
            onSubmit={handleAddTask}
            className="bg-white p-6 rounded shadow w-96 space-y-4"
          >
            <h3 className="font-semibold text-lg">
              Assign Task to {taskUser.name}
            </h3>

            <input
              type="text"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />

            <textarea
              placeholder="Description"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full border p-2 rounded"
            />

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowTaskModal(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save Task
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
