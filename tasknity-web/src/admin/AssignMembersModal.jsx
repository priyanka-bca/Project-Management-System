import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function AssignMembersModal({ groupId, onClose }) {
  const [members, setMembers] = useState([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Load users with role = member
  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, email")
      .eq("role", "member")
      .then(({ data }) => setMembers(data || []));
  }, []);

  const assignMember = async () => {
    if (!selected) return;

    setLoading(true);

    // prevent duplicate
    const { data: exists } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", groupId)
      .eq("user_id", selected)
      .maybeSingle();

    if (!exists) {
      await supabase.from("group_members").insert({
        group_id: groupId,
        user_id: selected,
      });
    }

    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">

        <h2 className="text-xl font-semibold">Assign Member</h2>

        <select
          className="border p-2 w-full"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">Select member</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.email}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={assignMember}
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Assigning..." : "Assign"}
          </button>
        </div>

      </div>
    </div>
  );
}
