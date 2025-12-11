import React, { useState } from "react";
import { supabase } from "../supabase";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) return toast.error(error.message);

    toast.success("Logged in!");
    navigate("/");
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleLogin}
        className="bg-white p-8 rounded shadow w-96 text-center">

        <h2 className="text-2xl font-bold mb-4">Login</h2>

        <input
          type="email"
          className="w-full p-2 border rounded mb-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full p-2 border rounded mb-3"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-blue-600 text-white py-2 rounded">
          Login
        </button>

        <Link to="/auth/forgot" className="text-sm block mt-2 text-blue-600">
          Forgot Password?
        </Link>

        <Link to="/auth/signup" className="text-sm block mt-2 text-blue-600">
          Create Account
        </Link>

        <Link to="/admin-login" className="text-sm block mt-3 text-red-700 font-bold">
          Admin Login →
        </Link>

      </form>
    </div>
  );
}
