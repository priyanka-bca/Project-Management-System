// src/components/Header.jsx
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
    <header className="bg-gray-900 text-white py-4 shadow-md flex justify-between px-8 items-center">
      <div>
        <h1 className="text-2xl font-bold">Project Management System</h1>
        <p className="text-sm opacity-75">Manage groups • Assign leaders • Track tasks</p>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={handleLogout} className="bg-red-600 px-3 py-1 rounded">
          Logout
        </button>
      </div>
    </header>
  );
}
