import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAdminLogin = (e) => {
    e.preventDefault();

    // 🔥 FIXED ADMIN CREDENTIALS
    const ADMIN_EMAIL = "admin@pms.com";
    const ADMIN_PASSWORD = "ADMIN123";

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      toast.success("Admin Login Successful!");
      navigate("/admin");
    } else {
      toast.error("Invalid Admin Credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-red-600">
          Admin Login
        </h2>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <input
            type="email"
            className="w-full border p-2 rounded"
            placeholder="Admin Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="w-full border p-2 rounded"
            placeholder="Admin Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
          >
            Login as Admin
          </button>
        </form>
      </div>
    </div>
  );
}
