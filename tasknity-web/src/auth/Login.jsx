import React, { useState } from "react";
import { supabase } from "../supabase";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 shadow-lg rounded-lg w-96 space-y-4"
      >
        <h2 className="text-xl font-bold">Login</h2>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <input
          className="w-full border p-2 rounded"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-blue-600 text-white py-2 rounded">
          Login
        </button>

        <div className="flex justify-between text-sm">
          <Link to="/signup" className="text-blue-600">Create Account</Link>
          <Link to="/forgot" className="text-blue-600">Forgot?</Link>
        </div>
      </form>
    </div>
  );
}
