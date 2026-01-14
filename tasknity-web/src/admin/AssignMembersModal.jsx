import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function AssignMembersModal({ groupId, onClose, onMemberAdded }) {
  const [allMembers, setAllMembers] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [selected, setSelected] = useState("");
  const [selectedRole, setSelectedRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [hasLeader, setHasLeader] = useState(false);
  const [error, setError] = useState("");

  // Load all members and check which are already in group
  useEffect(() => {
    loadMembers();
    checkForLeader();
  }, [groupId]);

  const loadMembers = async () => {
    // Get all members (users with role = member)
    const { data: members } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "member");

    // Get members already in this group
    const { data: groupMems } = await supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", groupId);

    setAllMembers(members || []);
    const groupMemberIds = (groupMems || []).map((m) => m.user_id);
    setGroupMembers(groupMemberIds);

    // Filter out members already in group
    const available = (members || []).filter(
      (m) => !groupMemberIds.includes(m.id)
    );
    setAvailableMembers(available);
  };

  const checkForLeader = async () => {
    const { data } = await supabase
      .from("group_members")
      .select("role")
      .eq("group_id", groupId)
      .eq("role", "leader");

    setHasLeader((data || []).length > 0);
  };

  const addMember = async () => {
    if (!selected) {
      setError("Please select a member");
      return;
    }

    if (selectedRole === "leader" && hasLeader) {
      setError("This group already has a leader. Only one leader per group allowed.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: err } = await supabase.from("group_members").insert({
        group_id: groupId,
        user_id: selected,
        role: selectedRole,
      });

      if (err) throw err;

      // Reset form
      setSelected("");
      setSelectedRole("member");
      
      // Notify parent
      if (onMemberAdded) onMemberAdded();
      
      onClose();
    } catch (err) {
      setError(err.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  const selectedMemberName = availableMembers.find((m) => m.id === selected)?.full_name || "";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
        <h2 className="text-xl font-semibold">Add Member to Group</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        {availableMembers.length === 0 ? (
          <p className="text-slate-500 text-center py-4">All members are already in this group</p>
        ) : (
          <>
            {/* Member Selection */}
            <div>
              <label className="text-sm font-medium text-slate-700">Select Member</label>
              <select
                className="border border-slate-300 p-2 w-full rounded mt-1 focus:ring-2 focus:ring-indigo-500"
                value={selected}
                onChange={(e) => {
                  setSelected(e.target.value);
                  setError("");
                }}
              >
                <option value="">Choose a member...</option>
                {availableMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name} ({m.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Role Selection */}
            {selected && (
              <div>
                <label className="text-sm font-medium text-slate-700">Select Role</label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="member"
                      checked={selectedRole === "member"}
                      onChange={(e) => {
                        setSelectedRole(e.target.value);
                        setError("");
                      }}
                    />
                    <span className="text-sm">Member</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="leader"
                      checked={selectedRole === "leader"}
                      onChange={(e) => {
                        setSelectedRole(e.target.value);
                        setError("");
                      }}
                      disabled={hasLeader}
                    />
                    <span className="text-sm">Leader {hasLeader && "(unavailable)"}</span>
                  </label>
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded text-sm"
          >
            Cancel
          </button>
          {availableMembers.length > 0 && (
            <button
              onClick={addMember}
              disabled={loading || !selected}
              className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Member"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
