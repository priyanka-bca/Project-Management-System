import { Link } from "react-router-dom";

export default function AdminNavbar() {
  return (
    <nav className="bg-white shadow border-b">
      <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>

        <div className="flex gap-6 text-gray-700">
          <Link className="hover:text-blue-600" to="/">Groups</Link>
          <Link className="hover:text-blue-600" to="/board">Task Board</Link>
          <Link className="hover:text-blue-600" to="/reports">Reports</Link>
          <Link className="hover:text-blue-600" to="/admin/analytics">Analytics</Link>
        </div>
      </div>
    </nav>
  );
}
