import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const { state } = useLocation();
  const navigate = useNavigate();

  const verifyOtp = async (e) => {
    e.preventDefault();

    const { data } = await supabase
      .from("email_otps")
      .select("*")
      .eq("email", state.email)
      .eq("otp", otp)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (!data) return alert("Invalid or expired OTP");

    await supabase
      .from("email_otps")
      .update({ verified: true })
      .eq("email", state.email);

    navigate("/auth/complete-profile", { state: { email: state.email } });
  };

  return (
    <form onSubmit={verifyOtp} className="auth-card">
      <h2>Verify OTP</h2>

      <input
        type="text"
        placeholder="6-digit OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        required
      />

      <button type="submit">Verify</button>
    </form>
  );
}
