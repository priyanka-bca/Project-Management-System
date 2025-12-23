import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function CompleteProfile() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return alert("Passwords do not match");

    const { data, error } = await supabase.auth.signUp({
      email: state.email,
      password,
    });

    if (error) return alert(error.message);

    await supabase.from("profiles").insert({
      id: data.user.id,
      email: state.email,
      name,
    });

    navigate("/auth/login");
  };

  return (
    <form onSubmit={submit} className="auth-card">
      <h2>Complete profile</h2>

      <input
        placeholder="Username"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Confirm password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
      />

      <button>Create account</button>
    </form>
  );
}
