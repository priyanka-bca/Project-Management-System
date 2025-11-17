import React, { useState } from "react";
import toast from "react-hot-toast";

export default function GroupForm({ addGroup }) {
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!groupName.trim()) {
      toast.error("Group name cannot be empty");
      return;
    }

    const newGroup = {
      id: crypto.randomUUID(),
      name: groupName,
      members: members
        ? members.split(",").map((m) => m.trim())
        : [],
      approved: false,
      leaderId: "",
    };

    addGroup(newGroup);
    toast.success(`Group "${groupName}" created successfully!`);

    setGroupName("");
    setMembers("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow border space-y-4"
    >
      <h3 className="text-xl font-semibold text-gray-700">
        Create New Group
      </h3>

      <div>
        <label className="text-sm font-medium text-gray-600">Group Name *</label>
        <input
          type="text"
          className="w-full p-2 border rounded mt-1"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Enter group name"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-600">
          Members (comma separated)
        </label>
        <input
          type="text"
          className="w-full p-2 border rounded mt-1"
          value={members}
          onChange={(e) => setMembers(e.target.value)}
          placeholder="e.g. John, Sara, Peter"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
      >
        + Create Group
      </button>
    </form>
  );
}
