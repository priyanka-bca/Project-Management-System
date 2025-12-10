import React from "react";
import { motion } from "framer-motion";

export default function Reports({ state = { groups: [], tasks: [] } }) {
  const { groups, tasks } = state;

  const totalGroups = groups.length;
  const approvedGroups = groups.filter((g) => g.approved).length;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length;
  const pendingTasks = tasks.filter((t) => t.status === "pending").length;

  const completionRate =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-10">
      <motion.h2
        className="text-3xl font-bold text-gray-800"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Reports & Dashboard
      </motion.h2>

      {/* Summary Cards */}
      <motion.div
        className="grid md:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* Groups */}
        <div className="bg-white p-6 rounded-xl border shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-700">Groups</h3>
          <p className="text-4xl font-bold text-blue-600">{totalGroups}</p>
          <p className="text-sm text-gray-500">{approvedGroups} approved</p>
        </div>

        {/* Tasks */}
        <div className="bg-white p-6 rounded-xl border shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-700">Total Tasks</h3>
          <p className="text-4xl font-bold text-green-600">{totalTasks}</p>
          <p className="text-sm text-gray-500">
            {completedTasks} completed
          </p>
        </div>

        {/* Overall Progress */}
        <div className="bg-white p-6 rounded-xl border shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-700">Overall Progress</h3>
          <p className="text-4xl font-bold text-indigo-600">{completionRate}%</p>

          <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>
      </motion.div>

      {/* Task Breakdown */}
      <div className="bg-white p-6 rounded-xl border shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Task Status Breakdown
        </h3>

        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div className="p-4 border rounded-md bg-gray-50">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{pendingTasks}</p>
          </div>

          <div className="p-4 border rounded-md bg-gray-50">
            <p className="text-sm text-gray-500">In Progress</p>
            <p className="text-3xl font-bold text-blue-600">{inProgressTasks}</p>
          </div>

          <div className="p-4 border rounded-md bg-gray-50">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-3xl font-bold text-green-600">{completedTasks}</p>
          </div>
        </div>
      </div>

      {/* Group Leaders Section */}
      <div className="bg-white p-6 rounded-xl border shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Group Leaders & Members
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 border-b text-left">Group Name</th>
                <th className="p-3 border-b text-left">Leader</th>
                <th className="p-3 border-b text-left">Members</th>
                <th className="p-3 border-b text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {groups.map((g) => (
                <tr
                  key={g.id}
                  className="hover:bg-gray-50 transition border-b"
                >
                  <td className="p-3">{g.name}</td>
                  <td className="p-3">{g.leaderId || "Unassigned"}</td>
                  <td className="p-3">{g.members.join(", ") || "No members"}</td>
                  <td className="p-3">
                    {g.approved ? (
                      <span className="text-green-600 font-semibold">
                        Approved
                      </span>
                    ) : (
                      <span className="text-yellow-600 font-semibold">
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
