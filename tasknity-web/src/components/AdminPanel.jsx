import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Users, CheckCircle, Clock } from "lucide-react";
import GroupForm from "./GroupForm";
import GroupList from "./GroupList";

export default function AdminPanel({
  role,
  groups,
  addGroup,
  approveGroup,
  assignLeader,
}) {
  const [tab, setTab] = useState("manage");
  const [filter, setFilter] = useState("all");

  if (role !== "admin") {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="bg-white shadow-xl rounded-2xl p-8 text-center">
          <p className="text-xl font-semibold">Access Denied</p>
          <p className="text-gray-500 text-sm mt-1">
            Admins only
          </p>
        </div>
      </div>
    );
  }

  const stats = useMemo(() => {
    return {
      total: groups.length,
      approved: groups.filter((g) => g.approved).length,
      pending: groups.filter((g) => !g.approved).length,
    };
  }, [groups]);

  const filteredGroups = useMemo(() => {
    if (filter === "approved") return groups.filter((g) => g.approved);
    if (filter === "pending") return groups.filter((g) => !g.approved);
    return groups;
  }, [groups, filter]);

  return (
    <motion.main
      className="max-w-7xl mx-auto p-6 space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-4">
        <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">
            Control groups & leadership
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Groups" value={stats.total} icon={Users} />
        <StatCard
          label="Approved"
          value={stats.approved}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={Clock}
          color="yellow"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-3">
        {["manage", "create"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition
              ${
                tab === t
                  ? "bg-blue-600 text-white shadow"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
          >
            {t === "manage" ? "Manage Groups" : "Create Group"}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {tab === "create" && (
          <motion.section
            key="create"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl shadow p-6"
          >
            <h2 className="text-xl font-semibold mb-4">
              Create New Group
            </h2>
            <GroupForm addGroup={addGroup} />
          </motion.section>
        )}

        {tab === "manage" && (
          <motion.section
            key="manage"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl shadow p-6 space-y-4"
          >
            {/* Filters */}
            <div className="flex gap-2">
              {["all", "approved", "pending"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition
                    ${
                      filter === f
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>

            <GroupList
              groups={filteredGroups}
              approveGroup={approveGroup}
              assignLeader={assignLeader}
            />
          </motion.section>
        )}
      </AnimatePresence>
    </motion.main>
  );
}

/* Stat Card */
function StatCard({ label, value, icon: Icon, color = "blue" }) {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl shadow p-5 flex items-center gap-4"
    >
      <div className={`p-3 rounded-xl ${colors[color]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </motion.div>
  );
}
