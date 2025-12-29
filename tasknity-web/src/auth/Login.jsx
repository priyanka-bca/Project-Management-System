import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // ✅ 1️⃣ Sign in with Supabase (NO OTP CHECK)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // ✅ 2️⃣ Fetch user role
      let { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      // ✅ 3️⃣ Create profile if missing
      if (!profile) {
        const { data: newProfile } = await supabase
          .from("profiles")
          .insert({
            id: data.user.id,
            role: "member",
          })
          .select()
          .single();

        profile = newProfile;
      }

      // ✅ 4️⃣ Redirect based on role
      if (profile.role === "admin") navigate("/");
      else if (profile.role === "member") navigate("/member/dashboard");
      else if (profile.role === "leader") navigate("/dashboard");
      else navigate("/");

    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 md:p-10">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-6">
        Welcome Back
      </h1>

      {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <input
          type="email"
          placeholder="Email"
          className="border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-indigo-700 transition"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>

      <p className="mt-6 text-center text-gray-500 text-sm">
        Don’t have an account?{" "}
        <Link
          to="/auth/signup"
          className="text-indigo-600 font-medium hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
