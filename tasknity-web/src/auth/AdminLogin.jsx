import React, { useState } from "react";
import { supabase } from "../supabase";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleAdminLogin(e) {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) return toast.error(error.message);

    // check role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile.role !== "admin") {
      toast.error("Access denied – Not an admin");
      return;
    }

    toast.success("Welcome Admin!");
    navigate("/admin");
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-200">
      <form
        onSubmit={handleAdminLogin}
        className="bg-white p-8 rounded shadow w-96 text-center"
      >
        <h2 className="text-2xl font-bold mb-4 text-red-600">Admin Login</h2>

        <input
          type="email"
          placeholder="Admin Email"
          className="w-full p-2 border rounded mb-3"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded mb-3"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-red-600 text-white py-2 rounded">
          Login as Admin
        </button>
      </form>
    </div>
  );
}
