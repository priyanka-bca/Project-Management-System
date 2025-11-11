import React from "react";

export default function GroupList({ groups, approveGroup, assignLeader, role }) {
  return (
    <div className="card">
      <h3>Group List</h3>
      {groups.length === 0 ? (
        <p>No groups created yet.</p>
      ) : (
        groups.map((group) => (
          <div key={group.id} className="group-item">
            <h4>
              {group.name}{" "}
              {group.approved ? (
                <span className="status approved">✔ Approved</span>
              ) : (
                <span className="status pending">⏳ Pending</span>
              )}
            </h4>

            <p>
              <strong>Members:</strong> {group.members.join(", ")}
            </p>

            {group.leaderId && (
              <p>
                <strong>Leader:</strong> {group.leaderId}
              </p>
            )}

            {role === "admin" && !group.approved && (
              <button onClick={() => approveGroup(group.id)}>Approve Group</button>
            )}

            {role === "admin" && group.approved && (
              <div className="leader-select">
                <label>Assign Leader:</label>
                <select
                  value={group.leaderId}
                  onChange={(e) => assignLeader(group.id, e.target.value)}
                >
                  <option value="">Select</option>
                  {group.members.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
