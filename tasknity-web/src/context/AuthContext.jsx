import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase";
import CryptoJS from "crypto-js";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Listen to Supabase auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 🔹 Fetch role from profiles table
  useEffect(() => {
    if (!user) {
      setRole(null);
      return;
    }

    supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        setRole(data?.role ?? null);
      });
  }, [user]);

  // 🔹 Send OTP (signup only)
  const signUpWithEmail = async (email) => {
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpHash = CryptoJS.SHA256(otp).toString();

      await supabase.from("email_otps").insert({
        email,
        otp_hash: otpHash,
        used: false,
        expires_at: new Date(Date.now() + 5 * 60 * 1000),
      });

      console.log("OTP (testing):", otp);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  // 🔹 Verify OTP
  const verifyOtp = async (email, otp) => {
    try {
      const otpHash = CryptoJS.SHA256(otp).toString();

      const { data } = await supabase
        .from("email_otps")
        .select("id, expires_at")
        .eq("email", email)
        .eq("otp_hash", otpHash)
        .eq("used", false)
        .maybeSingle();

      if (!data) {
        return { success: false, error: { message: "Invalid OTP" } };
      }

      if (new Date(data.expires_at) < new Date()) {
        return { success: false, error: { message: "OTP expired" } };
      }

      await supabase.from("email_otps").update({ used: true }).eq("id", data.id);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        signUpWithEmail,
        verifyOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
