// src/auth/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Handle email not confirmed specifically
      if (error.message?.toLowerCase().includes("confirm") || error.message?.toLowerCase().includes("confirmed")) {
        toast.error("Please confirm your email before logging in.");
      } else {
        toast.error(error.message);
      }
      return;
    }

    // data.session includes user token; profile fetch is performed by the App auth listener.
    toast.success("Logged in");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            className="w-full border p-2 rounded"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            className="w-full border p-2 rounded"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </form>

        <div className="flex justify-between mt-4">
          <a
            href="/auth/forgot"
            className="text-blue-600 hover:underline text-sm"
          >
            Forgot Password?
          </a>

          <a
            href="/admin-login"
            className="text-red-600 hover:underline text-sm font-semibold"
          >
            Admin Login
          </a>
        </div>


        <p className="text-center text-sm mt-3">
          Don’t have an account?{" "}
          <Link to="/auth/signup" className="text-blue-600 font-semibold">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
