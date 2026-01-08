import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const res = await signUp(email, password);

    if (!res.success) {
      setError(res.error.message);
      return;
    }

    navigate("/auth/verify", { state: { email } });
  };

  return (
    <form onSubmit={submit} className="max-w-md mx-auto mt-24">
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>

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
        Sign Up
      </button>
    </form>
  );
}
