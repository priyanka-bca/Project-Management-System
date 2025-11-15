import React from "react";

export default function Reports({ state }) {
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
    <main className="max-w-6xl mx-auto p-6 space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">
        Reports & Dashboard
      </h2>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow text-center border">
          <h3 className="text-lg font-semibold text-gray-700">Groups</h3>
          <p className="text-3xl font-bold text-blue-600">{totalGroups}</p>
          <p className="text-sm text-gray-500">
            {approvedGroups} approved groups
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow text-center border">
          <h3 className="text-lg font-semibold text-gray-700">Total Tasks</h3>
          <p className="text-3xl font-bold text-green-600">{totalTasks}</p>
          <p className="text-sm text-gray-500">
            {completedTasks} completed tasks
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow text-center border">
          <h3 className="text-lg font-semibold text-gray-700">
            Overall Progress
          </h3>
          <p className="text-3xl font-bold text-indigo-600">{completionRate}%</p>
          <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Task Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow border mt-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Task Status Breakdown
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div className="p-4 border rounded-md">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{pendingTasks}</p>
          </div>
          <div className="p-4 border rounded-md">
            <p className="text-sm text-gray-500">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">
              {inProgressTasks}
            </p>
          </div>
          <div className="p-4 border rounded-md">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
          </div>
        </div>
      </div>

      {/* Group-Leader Listing */}
      <div className="bg-white p-6 rounded-lg shadow border mt-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Group Leaders
        </h3>
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left border-b">Group Name</th>
              <th className="px-4 py-2 text-left border-b">Leader</th>
              <th className="px-4 py-2 text-left border-b">Members</th>
              <th className="px-4 py-2 text-left border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr
                key={g.id}
                className="hover:bg-gray-50 transition border-b last:border-none"
              >
                <td className="px-4 py-2">{g.name}</td>
                <td className="px-4 py-2">{g.leaderId || "Unassigned"}</td>
                <td className="px-4 py-2">
                  {g.members.join(", ") || "No members"}
                </td>
                <td className="px-4 py-2">
                  {g.approved ? (
                    <span className="text-green-600 font-medium">Approved</span>
                  ) : (
                    <span className="text-yellow-600 font-medium">Pending</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
