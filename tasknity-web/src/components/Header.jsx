import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/auth/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md px-6 py-4 flex justify-between items-center">
      {/* Title */}
      <h1 className="text-2xl font-bold">
        Project Management System
      </h1>

      {/* User & Logout */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="h-10 w-10 rounded-full bg-white text-indigo-700 flex items-center justify-center font-semibold">
          AD
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
