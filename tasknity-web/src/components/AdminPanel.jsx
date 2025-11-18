import { useState } from "react";
import { motion } from "framer-motion";
import GroupForm from "./GroupForm";
import GroupList from "./GroupList";

export default function AdminPanel({
  role,
  groups,
  addGroup,
  approveGroup,
  assignLeader,
}) {
  if (role !== "admin") {
    return (
      <div className="p-6 text-center text-gray-600">
        <p className="text-lg font-semibold">Access Denied</p>
        <p className="text-sm">Only Admins can view this section.</p>
      </div>
    );
  }

  return (
    <motion.main
      className="max-w-5xl mx-auto p-6 space-y-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-3xl font-bold text-gray-800 border-b pb-2">
        Manage Groups
      </h2>

      {/* Add Group Form */}
      <GroupForm addGroup={addGroup} />

      {/* Show Groups */}
      <GroupList
        groups={groups}
        approveGroup={approveGroup}
        assignLeader={assignLeader}
      />
    </motion.main>
  );
}
