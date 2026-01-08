import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase";
import CryptoJS from "crypto-js";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load session
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setLoading(false);
    };

    load();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // Load role
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

  // SIGNUP (create auth user + OTP)
  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) return { success: false, error };

    // generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = CryptoJS.SHA256(otp).toString();

    await supabase.from("email_otps").insert({
      email,
      otp_hash: otpHash,
    });

    console.log("OTP (dev):", otp); // replace with email sender later

    return { success: true, email };
  };

  // VERIFY OTP
  const verifyOtp = async (email, otp) => {
    const otpHash = CryptoJS.SHA256(otp).toString();

    const { data } = await supabase
      .from("email_otps")
      .select("id")
      .eq("email", email)
      .eq("otp_hash", otpHash)
      .maybeSingle();

    if (!data) {
      return { success: false, error: "Invalid OTP" };
    }

    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{ user, role, loading, signUp, verifyOtp }}
    >
      {children}
    </AuthContext.Provider>
  );
}
