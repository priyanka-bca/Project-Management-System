import React from "react";
import { motion } from "framer-motion";
import GroupForm from "./GroupForm";
import GroupList from "./GroupList";

export default function AdminPanel({ role, groups, addGroup, approveGroup, assignLeader }) {
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
      className="max-w-4xl mx-auto p-6 space-y-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h2
        className="text-3xl font-bold text-gray-800 border-b pb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Admin Panel
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <GroupForm addGroup={addGroup} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <GroupList
          groups={groups}
          approveGroup={approveGroup}
          assignLeader={assignLeader}
        />
      </motion.div>
    </motion.main>
  );
}
