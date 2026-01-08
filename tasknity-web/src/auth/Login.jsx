import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    const user = data.user;

    // 🔹 fetch role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      setError("Profile not found");
      return;
    }

    // 🔹 redirect by role
    if (profile.role === "admin") navigate("/");
    else if (profile.role === "member") navigate("/member/dashboard");
    else if (profile.role === "leader") navigate("/dashboard");
    else navigate("/auth/login");
  };

  return (
    <form onSubmit={submit} className="max-w-md mx-auto mt-24">
      <h2 className="text-2xl font-bold mb-4">Login</h2>

      {error && <p className="text-red-600">{error}</p>}

      <input
        type="email"
        placeholder="Email"
        className="border p-3 w-full mb-3"
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        className="border p-3 w-full mb-3"
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button className="bg-black text-white p-3 w-full">
        Login
      </button>
    </form>
  );
}
