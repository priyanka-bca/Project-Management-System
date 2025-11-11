import React from "react";

export default function Reports({ state }) {
  const { groups, tasks } = state;

  // Summary stats
  const totalTasks = tasks.length;
  const completed = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => t.status === "in-progress").length;
  const pending = tasks.filter((t) => t.status === "todo").length;

  const completionRate =
    totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

  return (
    <main>
      <div className="card">
        <h3>📊 Overall Task Summary</h3>
        <p>Total Tasks: {totalTasks}</p>
        <p>Completed: ✅ {completed}</p>
        <p>In Progress: 🔄 {inProgress}</p>
        <p>Pending: ⏳ {pending}</p>
        <p>
          <strong>Completion Rate:</strong> {completionRate}%
        </p>
      </div>

      <div className="card">
        <h3>👥 Group Reports</h3>
        {groups.length === 0 ? (
          <p>No groups available.</p>
        ) : (
          groups.map((group) => {
            const groupTasks = tasks.filter((t) => t.groupId === group.id);
            const done = groupTasks.filter((t) => t.status === "done").length;
            const rate =
              groupTasks.length > 0
                ? Math.round((done / groupTasks.length) * 100)
                : 0;

            return (
              <div key={group.id} className="report-group">
                <h4>{group.name}</h4>
                <p>Members: {group.members.join(", ")}</p>
                {group.leaderId && <p>Leader: {group.leaderId}</p>}
                <p>Total Tasks: {groupTasks.length}</p>
                <p>Completed: {done}</p>
                <p>Progress: {rate}%</p>
                <hr />
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
