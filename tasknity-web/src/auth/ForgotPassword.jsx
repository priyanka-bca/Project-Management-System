import React, { useState } from "react";
import { supabase } from "../supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (!error) {
      setMsg("Password reset link sent to your email!");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form className="bg-white p-6 rounded-lg shadow w-96 space-y-4">
        <h2 className="text-xl font-semibold">Reset Password</h2>

        <input
          type="email"
          className="w-full border p-2 rounded"
          placeholder="Your email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleReset}
          className="w-full bg-purple-600 text-white py-2 rounded"
        >
          Send Reset Link
        </button>

        {msg && <p className="text-green-600 text-sm pt-2">{msg}</p>}
      </form>
    </div>
  );
}
