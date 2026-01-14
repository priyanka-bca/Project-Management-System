import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";

export default function VerifyOtp() {
  const { verifyOtp } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();

  const email = state?.email;
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  if (!email) return <p>Invalid access</p>;

  const submit = async (e) => {
    e.preventDefault();

    const res = await verifyOtp(email, otp);
    if (!res.success) {
      setError(res.error);
      return;
    }

    // create profile with admin role
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("profiles").insert({
      id: user.id,
      email,
      role: "admin",  // React app creates admin accounts only
    });

    navigate("/auth/login");
  };

  return (
    <form onSubmit={submit} className="max-w-md mx-auto mt-24">
      <h2 className="text-2xl font-bold mb-4">Verify OTP</h2>

      {error && <p className="text-red-600">{error}</p>}

      <input
        placeholder="Enter OTP"
        className="border p-3 w-full mb-3"
        onChange={(e) => setOtp(e.target.value)}
        required
      />

      <button className="bg-black text-white p-3 w-full">
        Verify
      </button>
    </form>
  );
}
