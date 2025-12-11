import React, { useState } from "react";
import { supabase } from "../supabase";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup(e) {
    e.preventDefault();

    const { error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) return toast.error(error.message);

    toast.success("Check your email for confirmation.");
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSignup}
        className="bg-white p-8 rounded shadow w-96 text-center">

        <h2 className="text-2xl font-bold mb-4">Sign Up</h2>

        <input
          type="email"
          className="w-full p-2 border rounded mb-3"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full p-2 border rounded mb-3"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-green-600 text-white py-2 rounded">
          Create Account
        </button>

        <Link to="/auth/login" className="text-sm block mt-2 text-blue-600">
          Already have an account? Login
        </Link>

      </form>
    </div>
  );
}
