// src/auth/ForgotPassword.jsx
import React, { useState } from "react";
import { supabase } from "../supabase";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/login`,
    });

    if (error) toast.error(error.message);
    else toast.success("Password reset email sent!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>

        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="email"
            className="w-full border p-2 rounded"
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
          >
            Send Reset Link
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Back to <Link to="/auth/login" className="text-blue-600 font-semibold">Login</Link>
        </p>
      </div>
    </div>
  );
}
