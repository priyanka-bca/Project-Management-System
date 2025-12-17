import { useState } from "react";
import { supabase } from "../supabase";
import { useLocation, useNavigate } from "react-router-dom";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const { state } = useLocation();
  const navigate = useNavigate();

  const email = state?.email;

  const handleVerify = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (error) {
      alert(error.message);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <form onSubmit={handleVerify} className="auth-card">
      <h2>Verify OTP</h2>

      <input
        type="text"
        placeholder="6 digit code"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />

      <button type="submit">Verify</button>
    </form>
  );
}
