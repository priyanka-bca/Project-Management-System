import { useState } from "react";
import { supabase } from "../supabase";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) return toast.error(error.message);

    // Create profile record
    await supabase.from("profiles").insert([
      { id: data.user.id, email: email, role: "user" },
    ]);

    toast.success("Signup successful! Confirm your email.");
    navigate("/auth/login");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white w-96 shadow-lg p-6 rounded">
        <h2 className="text-2xl font-bold mb-4">Signup</h2>

        <form onSubmit={handleSignup} className="space-y-3">
          <input
            type="email"
            className="border p-2 rounded w-full"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            className="border p-2 rounded w-full"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="bg-green-600 text-white px-4 py-2 rounded w-full">
            Signup
          </button>
        </form>

        <p className="mt-3 text-sm">
          Already have an account?{" "}
          <Link className="text-blue-600" to="/auth/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
