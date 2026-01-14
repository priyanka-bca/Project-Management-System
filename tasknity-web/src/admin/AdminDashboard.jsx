import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import CreateGroupModal from "./CreateGroupModal";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [groups, setGroups] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    const { data } = await supabase.from("groups").select("*");
    setGroups(data || []);
  };

  const handleDeleteGroup = async (groupId, groupName) => {
    if (!window.confirm(`Are you sure you want to delete the group "${groupName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // Delete all members in the group first
      await supabase.from("group_members").delete().eq("group_id", groupId);
      
      // Delete all tasks in the group
      await supabase.from("tasks").delete().eq("group_id", groupId);
      
      // Delete the group
      await supabase.from("groups").delete().eq("id", groupId);
      
      // Refresh the list
      await fetchGroups();
      alert("Group deleted successfully");
    } catch (error) {
      alert("Failed to delete group: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="max-w-7xl mx-auto px-6 py-12">

        {/* HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage groups and active projects
            </p>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition"
          >
            + Create Group
          </button>
        </header>

        {/* GROUP GRID */}
        {groups.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-white p-20 text-center text-slate-500">
            No groups created yet
          </div>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {groups.map((g) => (
              <div
                key={g.id}
                className="group relative text-left rounded-2xl bg-white p-7 shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition"
              >
                {/* Card Accent */}
                <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-indigo-500 to-indigo-400 opacity-0 group-hover:opacity-100 transition" />

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteGroup(g.id, g.name);
                  }}
                  className="absolute top-4 right-4 text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition"
                  title="Delete group"
                >
                  🗑️
                </button>

                <button
                  onClick={() => navigate(`/admin/group/${g.id}`)}
                  className="w-full text-left"
                >
                  <h2 className="text-xl font-medium text-slate-900 group-hover:text-indigo-600 transition">
                    {g.name}
                  </h2>

                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                    {g.project_name || "No project assigned"}
                  </p>

                  <div className="mt-8 flex items-center justify-between">
                    <span className="text-sm font-medium text-indigo-600">
                      Open group →
                    </span>

                    <span className="text-xs text-slate-400">
                      View details
                    </span>
                  </div>
                </button>
              </div>
            ))}
          </section>
        )}
      </main>

      {showCreate && (
        <CreateGroupModal
          onClose={() => setShowCreate(false)}
          onCreated={fetchGroups}
        />
      )}
    </div>
  );
}
