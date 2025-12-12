import React from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth/login");
  };

  return (
    <header className="bg-gray-900 text-white py-4 px-8 flex justify-between">
      <h1 className="text-xl font-bold">Project Management System</h1>

      <button
        onClick={handleLogout}
        className="bg-red-600 px-4 py-2 rounded"
      >
        Logout
      </button>
    </header>
  );
}
