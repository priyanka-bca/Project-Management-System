import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function CreateGroupModal({ onClose, onCreated }) {
  const [groupName, setGroupName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!groupName.trim() || !projectName.trim()) return;

    setLoading(true);

    await supabase.from("groups").insert({
      name: groupName,
      project_name: projectName,
    });

    setLoading(false);
    onCreated();
    onClose();
  };

  /* Close on ESC */
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      
      {/* BACKDROP CLICK */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-slate-200">
        
        {/* HEADER */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-slate-900">
            Create Group
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Add a new group and assign a project
          </p>
        </div>

        {/* FORM */}
        <div className="space-y-4">
          <Input
            label="Group name"
            placeholder="e.g. Frontend Team"
            value={groupName}
            onChange={setGroupName}
          />

          <Input
            label="Project name"
            placeholder="e.g. Website Redesign"
            value={projectName}
            onChange={setProjectName}
          />
        </div>

        {/* ACTIONS */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------- INPUT FIELD -------- */
function Input({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
    </label>
  );
}
