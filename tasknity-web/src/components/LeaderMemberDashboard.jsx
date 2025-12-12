import React from "react";
import TaskCard from "./TaskCard";

export default function LeaderMemberDashboard({ role, groups, tasks }) {
  const userEmail = "ReplaceWithUserEmail"; // << Replace later with session.user.email

  const myGroup = groups.find(
    (g) => g.leaderId === userEmail || g.members.includes(userEmail)
  );

  if (!myGroup)
    return (
      <div className="p-6 text-center text-gray-600">
        <p className="text-lg font-semibold">No group assigned yet.</p>
      </div>
    );

  const visibleTasks =
    role === "leader"
      ? tasks.filter((t) => t.groupId === myGroup.id)
      : tasks.filter((t) => t.assignedTo === userEmail);

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">
        {role === "leader" ? "Leader Dashboard" : "Member Dashboard"}
      </h2>

      <div className="bg-white border rounded shadow p-4">
        <p className="text-lg font-semibold">Group: {myGroup.name}</p>
        <p className="text-sm text-gray-600">
          Members: {myGroup.members.join(", ")}
        </p>
        <p className="text-sm text-gray-600">
          Leader: <span className="font-medium">{myGroup.leaderId}</span>
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {visibleTasks.length === 0 ? (
          <p className="col-span-3 text-center text-gray-500">No tasks.</p>
        ) : (
          visibleTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))
        )}
      </div>
    </main>
  );
}
