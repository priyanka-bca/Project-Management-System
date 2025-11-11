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
    <div className="card">
      <h3>Create New Group</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Group Name:</label>
          <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="e.g., Backend Team"
            required
          />
        </div>
        <div>
          <label>Members (comma-separated):</label>
          <input
            value={members}
            onChange={(e) => setMembers(e.target.value)}
            placeholder="Alice, Bob, Charlie"
          />
        </div>
        <button type="submit">Add Group</button>
      </form>
    </div>
  );
}
