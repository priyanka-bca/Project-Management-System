import React from "react";
import TaskCard from "../components/TaskCard";

export default function LeaderMemberDashboard({
  role,
  groups = [],
  tasks = [],
}) {
  // TEMP: using email later (safe even if session not ready)
  const currentUserEmail = "";

  // Ensure arrays
  const safeGroups = Array.isArray(groups) ? groups : [];
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const myGroup = safeGroups.find(
    (g) =>
      g.leaderId === currentUserEmail ||
      (Array.isArray(g.members) && g.members.includes(currentUserEmail))
  );

  if (!myGroup) {
    return (
      <div className="p-6 text-center text-gray-600">
        <p className="text-lg font-semibold">No group assigned yet.</p>
        <p className="text-sm">Please wait for admin assignment.</p>
      </div>
    );
  }

  const visibleTasks =
    role === "leader"
      ? safeTasks.filter((t) => t.groupId === myGroup.id)
      : safeTasks.filter((t) => t.assignedTo === currentUserEmail);

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">
        {role === "leader" ? "Leader Dashboard" : "Member Dashboard"}
      </h2>

      <div className="bg-white border p-4 rounded shadow">
        <p className="font-semibold">Group: {myGroup.name}</p>
        <p className="text-sm text-gray-600">
          Members: {myGroup.members.join(", ")}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {visibleTasks.length === 0 ? (
          <p className="col-span-3 text-center text-gray-500">
            No tasks assigned.
          </p>
        ) : (
          visibleTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))
        )}
      </div>
    </main>
  );
}
