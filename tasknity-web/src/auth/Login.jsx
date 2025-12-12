import { useState } from "react";
import { supabase } from "../supabase";
import { Link, useNavigate } from "react-router-dom";
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

    if (error) return toast.error(error.message);

    toast.success("Login successful!");
    navigate("/");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white w-96 shadow-lg p-6 rounded">
        <h2 className="text-2xl font-bold mb-4">Login</h2>

        <form onSubmit={handleLogin} className="space-y-3">
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
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">
            Login
          </button>
        </form>

        <p className="mt-3 text-sm">
          Don’t have an account?{" "}
          <Link className="text-blue-600" to="/auth/signup">Signup</Link>
        </p>

        <p className="text-sm mt-1">
          <Link className="text-blue-600" to="/auth/forgot">
            Forgot password?
          </Link>
        </p>
      </div>
    </div>
  );
}
