import { useState } from "react";
import { supabase } from "../supabase";

export default function CreateGroupModal({ onClose, onCreated }) {
  const [groupName, setGroupName] = useState("");
  const [projectName, setProjectName] = useState("");

  const handleCreate = async () => {
    if (!groupName || !projectName) return;

    await supabase.from("groups").insert({
      name: groupName,
      project_name: projectName,
    });

    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-96 space-y-4">
        <h2 className="text-lg font-semibold">Create Group</h2>

        <input
          placeholder="Group Name"
          className="border p-2 w-full"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        <input
          placeholder="Project Name"
          className="border p-2 w-full"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
