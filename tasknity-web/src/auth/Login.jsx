import { useState } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return alert(error.message);
    navigate("/");
  };

  return (
    <form onSubmit={login} className="auth-card">
      <h2>Login</h2>

      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button>Login</button>
    </form>
  );
}
