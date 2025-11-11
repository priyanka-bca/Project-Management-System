import React from "react";

export default function RoleSwitcher({ role, setRole }) {
  return (
    <div className="role-switcher">
      <label>Current Role: </label>
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="admin">Admin</option>
        <option value="leader">Leader</option>
        <option value="member">Member</option>
      </select>
    </div>
  );
}
