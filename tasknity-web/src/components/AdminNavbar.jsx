  import { Link } from "react-router-dom";

export default function AdminNavbar() {
  return (
    <nav className="w-full bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        
        <h1 className="text-xl font-bold text-gray-800">
          Admin Dashboard
        </h1>

        <div className="flex gap-6 text-gray-700 font-medium">
          <Link 
            to="/admin" 
            className="hover:text-blue-600 transition"
          >
            Groups
          </Link>

          <Link 
            to="/board" 
            className="hover:text-blue-600 transition"
          >
            Task Board
          </Link>

          <Link 
            to="/reports" 
            className="hover:text-blue-600 transition"
          >
            Reports
          </Link>
        </div>

      </div>
    </nav>
  );
}
