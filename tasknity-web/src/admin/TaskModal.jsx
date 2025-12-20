import { useState } from "react";
import { supabase } from "../supabase";

export default function AddTaskModal({ groupId, member, onClose, onSaved }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase.from("tasks").insert({
      group_id: groupId,
      assigned_to: member.id,
      title,
      description,
      due_date: dueDate,
    });

    if (!error) {
      onSaved();
      onClose();
    } else {
      alert(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow w-96 space-y-3"
      >
        <h3 className="font-semibold text-lg">
          Assign Task to {member.name}
        </h3>

        <input
          placeholder="Task title"
          className="border p-2 w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Description"
          className="border p-2 w-full"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="date"
          className="border p-2 w-full"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="bg-blue-600 text-white px-4 py-1 rounded">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
