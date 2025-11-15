import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function GroupForm({ addGroup }) {
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    const newGroup = {
      id: uuidv4(),
      name: groupName,
      members: members.split(",").map((m) => m.trim()),
      leaderId: "",
      approved: false,
    };

    addGroup(newGroup);
    setGroupName("");
    setMembers("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow p-4 rounded-md space-y-4 border"
    >
      <h3 className="text-lg font-semibold text-gray-700">Create New Group</h3>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Group Name</label>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="border rounded p-2"
          placeholder="Enter group name"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Members (comma separated)</label>
        <input
          type="text"
          value={members}
          onChange={(e) => setMembers(e.target.value)}
          className="border rounded p-2"
          placeholder="e.g. Alice, Bob, Charlie"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Add Group
      </button>
    </form>
  );
}
