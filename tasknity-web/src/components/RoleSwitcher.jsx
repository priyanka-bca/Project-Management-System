export default function RoleSwitcher({ role, setRole }) {
  return (
    <div className="role-switcher flex justify-center gap-2 my-4">
      <label className="font-medium">Current Role:</label>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="border rounded p-1"
      >
        <option value="admin">Admin</option>
        <option value="leader">Leader (Alice)</option>
        <option value="member">Member (Bob)</option>
      </select>
    </div>
  );
}
