import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabase";
import TaskList from "./TaskList";
import AssignMembersModal from "./AssignMembersModal";
import Notifications from "./Notifications";

export default function GroupDetails() {
  const { groupId } = useParams();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  /* TASK MODAL */
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskUser, setTaskUser] = useState(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    loadCurrentUser();
    loadGroup();
    loadMembers();
    loadTasks();
  }, [groupId]);

  /* ---------------- LOAD CURRENT USER ROLE ---------------- */
  const loadCurrentUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      setCurrentUserId(data.user.id);
      
      // Get current user's role in this group
      const { data: userRole } = await supabase
        .from("group_members")
        .select("role")
        .eq("group_id", groupId)
        .eq("user_id", data.user.id)
        .single();

      if (userRole) {
        setCurrentUserRole(userRole.role);
      } else {
        // Check if user is admin (admins can manage all groups)
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();
        
        if (profile?.role === "admin") {
          setCurrentUserRole("admin");
        }
      }
    }
  };

  /* ---------------- LOAD DATA ---------------- */
  const loadGroup = async () => {
    const { data } = await supabase
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .single();

    setGroup(data);
    setLoading(false);
  };

  const loadMembers = async () => {
    const { data } = await supabase
      .from("group_members")
      .select(`id, role, user_id, profiles ( id, full_name, email )`)
      .eq("group_id", groupId);

    setMembers(data || []);
  };

  const loadTasks = async () => {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("group_id", groupId);

    setTasks(data || []);
  };

  /* ---------------- TASK FILTERS ---------------- */
  const completedTasks = tasks.filter((t) => t.status === "completed");
  const pendingTasks = tasks.filter((t) => t.status === "pending");

  /* ---------------- CHANGE MEMBER ROLE ---------------- */
  const handleChangeRole = async (memberId, currentRole) => {
    const newRole = currentRole === "member" ? "leader" : "member";

    // Check if trying to add a leader when one already exists
    if (newRole === "leader") {
      const hasLeader = members.some((m) => m.role === "leader" && m.id !== memberId);
      if (hasLeader) {
        alert("This group already has a leader. Only one leader per group allowed.");
        return;
      }
    }

    try {
      await supabase
        .from("group_members")
        .update({ role: newRole })
        .eq("id", memberId);

      loadMembers();
    } catch (error) {
      alert("Failed to update member role: " + error.message);
    }
  };

  /* ---------------- REMOVE MEMBER FROM GROUP ---------------- */
  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this group?`)) {
      return;
    }

    try {
      await supabase
        .from("group_members")
        .delete()
        .eq("id", memberId);

      loadMembers();
      loadTasks(); // Refresh tasks in case this member had tasks
    } catch (error) {
      alert("Failed to remove member: " + error.message);
    }
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

    setTitle("");
    setDesc("");
    setDueDate("");
    setTaskUser(null);
    setShowTaskModal(false);

    loadTasks(); // refresh tasks
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading…
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-100">
      {/* HEADER */}
      <header className="bg-white rounded-2xl border shadow-sm p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">{group.name}</h1>
          <p className="mt-1 text-sm text-slate-500">Group dashboard overview</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
            {group.project_name}
          </span>
          <span className="text-sm text-slate-500">Members: {members.length}</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 space-y-10">

        {/* STATS */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard label="Total Tasks" value={tasks.length} color="blue" />
          <StatCard label="Pending" value={pendingTasks.length} color="yellow" />
          <StatCard label="Completed" value={completedTasks.length} color="green" />
        </section>

        {/* MEMBERS */}
        <section className="bg-white rounded-2xl border shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-slate-800">Members</h2>
            {currentUserRole === "admin" && (
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="text-sm font-medium bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700"
              >
                + Add Member
              </button>
            )}
          </div>

          {members.length === 0 ? (
            <EmptyState text="No members added yet" />
          ) : (
            <ul className="divide-y">
              {members.map((m) => (
                <li key={m.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={m.profiles.full_name} />
                    <div>
                      <p className="text-slate-700 font-medium">{m.profiles.full_name}</p>
                      <p className="text-xs text-slate-500">{m.profiles.email}</p>
                      <p className="text-xs font-semibold mt-1 uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded w-fit">
                        {m.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {(currentUserRole === "leader") && m.role === "member" && (
                      <button
                        onClick={() => {
                          setTaskUser(m.profiles);
                          setShowTaskModal(true);
                        }}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700 px-2 py-1 rounded hover:bg-indigo-50"
                      >
                        + Task
                      </button>
                    )}

                    {(currentUserRole === "admin") && (
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === m.id ? null : m.id)}
                          className="text-slate-600 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100"
                          title="More options"
                        >
                          ⋮
                        </button>

                        {openMenuId === m.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                            <button
                              onClick={() => {
                                handleChangeRole(m.id, m.role);
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 first:rounded-t-lg flex items-center gap-2"
                            >
                              👤 {m.role === "member" ? "Make Leader" : "Make Member"}
                            </button>

                            <div className="border-t border-slate-100"></div>

                            <button
                              onClick={() => {
                                handleRemoveMember(m.id, m.profiles.full_name);
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 last:rounded-b-lg flex items-center gap-2"
                            >
                              ✕ Remove from Group
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* TASKS */}
        <section className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="text-lg font-medium text-slate-800 mb-4">Tasks</h2>
          <TaskList groupId={groupId} />
        </section>

        {/* NOTIFICATIONS */}
        <section className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="text-lg font-medium text-slate-800 mb-4">📢 Document Reminders</h2>
          <Notifications />
        </section>
      </main>

      {/* TASK MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setShowTaskModal(false)} />
          <form
            onSubmit={handleAddTask}
            className="relative z-10 w-full max-w-md rounded-2xl bg-white p-8 shadow-xl space-y-5"
          >
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Assign Task</h3>
              <p className="text-sm text-slate-500">To {taskUser.full_name}</p>
            </div>

            <input
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              required
            />

            <textarea
              placeholder="Description"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            />

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              required
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowTaskModal(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Save Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD MEMBER MODAL */}
      {showAddMemberModal && (
        <AssignMembersModal
          groupId={groupId}
          onClose={() => setShowAddMemberModal(false)}
          onMemberAdded={loadMembers}
        />
      )}
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function StatCard({ label, value, color }) {
  const colors = {
    blue: "bg-blue-100 text-blue-700",
    yellow: "bg-yellow-100 text-yellow-700",
    green: "bg-green-100 text-green-700",
  };

  return (
    <div className={`rounded-2xl p-6 ${colors[color]} shadow-sm`}>
      <p className="text-sm">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function Avatar({ name }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
  return (
    <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold">
      {initials}
    </div>
  );
}

function EmptyState({ text }) {
  return <div className="py-16 text-center text-slate-500">{text}</div>;
}
