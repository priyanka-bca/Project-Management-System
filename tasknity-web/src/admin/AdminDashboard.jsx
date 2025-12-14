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

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Create Group
        </button>
      </div>

      {/* Group Cards */}
      <div className="grid grid-cols-3 gap-4">
        {groups.map((g) => (
          <div
            key={g.id}
            onClick={() => navigate(`/admin/group/${g.id}`)}
            className="cursor-pointer bg-white p-4 shadow rounded hover:shadow-lg"
          >
            <h2 className="font-semibold">{g.name}</h2>
            <p className="text-sm text-gray-500">{g.project_name}</p>
          </div>
        ))}
      </div>

      {showCreate && (
        <CreateGroupModal
          onClose={() => setShowCreate(false)}
          onCreated={fetchGroups}
        />
      )}
    </div>
  );
}
