import { useState } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    if (error) {
      alert(error.message);
    } else {
      navigate("/auth/verify", { state: { email } });
    }
  };

  return (
    <form onSubmit={handleSignup} className="auth-card">
      <h2>Create Account</h2>

      <input
        type="email"
        placeholder="Email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button type="submit">Send OTP</button>
    </form>
  );
}
