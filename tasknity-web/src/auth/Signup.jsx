// src/auth/Signup.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import toast from "react-hot-toast";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    // 1) Sign up user with Supabase Auth
    const { data: signData, error: signError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signError) {
      toast.error(signError.message);
      return;
    }

    // signData.user may be null if confirmation email required - we still can insert profile once uid available
    const userId = signData?.user?.id;

    // If userId is available immediately, insert profile
    if (userId) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        full_name: fullName,
        role: "user",
      });

      if (profileError) {
        // Not fatal for signup, but inform
        toast.error("Signed up but failed to create profile: " + profileError.message);
        return;
      }
    } else {
      // In some Supabase setups email confirmation is required before user row becomes active.
      // You can optionally create the profile later after email confirm (see login flow).
      toast.success("Signed up! Please confirm your email (check inbox).");
      navigate("/auth/login");
      return;
    }

    toast.success("Signup complete! You can now login.");
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            className="w-full border p-2 rounded"
            placeholder="Full name (optional)"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            type="email"
            className="w-full border p-2 rounded"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            className="w-full border p-2 rounded"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-blue-600 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
