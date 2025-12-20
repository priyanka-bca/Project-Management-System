import { useState } from "react";
import { supabase } from "../supabase";
import toast from "react-hot-toast";

export default function AddTaskModal({ groupId, member, onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleCreate = async () => {
    if (!title || !dueDate) {
      toast.error("Title and Due Date required");
      return;
    }

    const { error } = await supabase.from("tasks").insert({
      group_id: groupId,
      assigned_to: member.user_id,
      title,
      description: desc,
      due_date: dueDate,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Task created");
    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-96 space-y-4">
        <h2 className="text-lg font-semibold">
          Add Task → {member.profiles.email}
        </h2>

        <input
          className="border p-2 w-full"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="border p-2 w-full"
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <input
          type="date"
          className="border p-2 w-full"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
}
