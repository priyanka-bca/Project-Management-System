import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import sha256 from "crypto-js/sha256";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email) {
      setError("Email missing. Please sign up again.");
      setLoading(false);
      return;
    }

    const otpHash = sha256(otp).toString();

    const { data, error } = await supabase
      .from("email_otps")
      .select("used, expires_at")
      .eq("email", email)
      .eq("otp_hash", otpHash)
      .eq("used", false)
      .single();

    if (error || !data) {
      setError("Invalid or expired OTP");
      setLoading(false);
      return;
    }

    // mark OTP as used
    await supabase
      .from("email_otps")
      .update({ used: true })
      .eq("email", email)
      .eq("otp_hash", otpHash);

    navigate("/auth/login");
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 md:p-10">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-6">
        Verify OTP
      </h1>

      <p className="text-center text-gray-600 mb-4">
        Enter the code sent to <b>{email}</b>
      </p>

      {error && (
        <p className="text-red-600 mb-4 text-center font-medium">{error}</p>
      )}

      <form onSubmit={handleVerify} className="flex flex-col gap-5">
        <input
          type="text"
          placeholder="Enter OTP"
          className="border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center tracking-widest"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />

        <button
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-indigo-700 transition"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
    </div>
  );
}
