import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useParams } from "react-router-dom";

export default function GroupDetails() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [users, setUsers] = useState([]);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    loadGroup();
    loadUsers();
    loadMembers();
  }, []);

  const loadGroup = async () => {
    const { data } = await supabase.from("groups").select("*").eq("id", id).single();
    setGroup(data);
  };

  const loadUsers = async () => {
    const { data } = await supabase.from("profiles").select("*");
    setUsers(data || []);
  };

  const loadMembers = async () => {
    const { data } = await supabase
      .from("group_members")
      .select("*, profiles(email)")
      .eq("group_id", id);
    setMembers(data || []);
  };

  const addMember = async (userId) => {
    await supabase.from("group_members").insert({
      group_id: id,
      user_id: userId,
    });
    loadMembers();
  };

  if (!group) return null;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">
        {group.name} — {group.project_name}
      </h1>

      <section>
        <h2 className="font-semibold mb-2">Add Members</h2>
        <div className="flex gap-2">
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => addMember(u.id)}
              className="border px-3 py-1 rounded"
            >
              {u.email}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-2">Members</h2>
        {members.map((m) => (
          <div key={m.id} className="flex justify-between border p-2 mb-2">
            <span>{m.profiles.email}</span>
            <span className="text-blue-600 cursor-pointer">
              ➕ Add Task
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}
