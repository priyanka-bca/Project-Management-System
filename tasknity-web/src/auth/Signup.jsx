import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signUpWithEmail } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signUpWithEmail(email);
    if (!result.success) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    navigate("/auth/verify", { state: { email } });
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 md:p-10">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-6">
        Create Account
      </h1>

      {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

      <form onSubmit={handleSignup} className="flex flex-col gap-5">
        <input
          type="email"
          placeholder="Email"
          className="border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-indigo-700 transition"
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>
      </form>

      <p className="mt-6 text-center text-gray-500 text-sm">
        Already have an account?{" "}
        <Link className="text-indigo-600 font-medium hover:underline" to="/auth/login">
          Login
        </Link>
      </p>
    </div>
  );
}
