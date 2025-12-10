import React from "react";
import toast from "react-hot-toast";

export default function GroupList({ groups, approveGroup, assignLeader }) {
  if (!groups.length) {
    return (
      <p className="text-gray-600 bg-white p-4 rounded-lg border shadow">
        No groups created yet.
      </p>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow border space-y-4">
      <h3 className="text-xl font-semibold text-gray-700 mb-3">
        Existing Groups
      </h3>

      {groups.map((g) => (
        <div
          key={g.id}
          className="p-4 border rounded-lg bg-gray-50 shadow-sm"
        >
          <p className="text-lg font-semibold text-gray-800">
            {g.name}{" "}
            {g.approved ? (
              <span className="text-green-600 text-sm">(Approved)</span>
            ) : (
              <span className="text-yellow-600 text-sm">(Pending)</span>
            )}
          </p>

          <p className="text-sm text-gray-600 mt-1">
            Members: {g.members.join(", ") || "No members"}
          </p>

          <div className="flex gap-4 mt-3">
            {!g.approved && (
              <button
                onClick={() => {
                  approveGroup(g.id);
                  toast.success(`Group "${g.name}" approved!`);
                }}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Approve
              </button>
            )}

            <select
              defaultValue={g.leaderId || ""}
              onChange={(e) => {
                assignLeader(g.id, e.target.value);
                toast.success(`Leader assigned to ${g.name}`);
              }}
              className="border rounded p-1"
            >
              <option value="">Assign Leader</option>
              {g.members.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {g.leaderId && (
            <p className="text-sm text-gray-700 mt-2">
              Leader: <span className="font-medium">{g.leaderId}</span>
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
