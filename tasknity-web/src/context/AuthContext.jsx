import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase";
import CryptoJS from "crypto-js";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionRestored, setSessionRestored] = useState(false);

  // Initialize auth on mount - restore session first
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (isMounted) {
          if (data?.session?.user) {
            console.log("Session restored from storage");
            setUser(data.session.user);
          } else {
            console.log("No session found in storage");
            setUser(null);
            setLoading(false); // No session, stop loading immediately
          }
          setSessionRestored(true);
        }
      } catch (err) {
        console.error("Session restore error:", err);
        if (isMounted) {
          setUser(null);
          setLoading(false);
          setSessionRestored(true);
        }
      }
    };

    restoreSession();

    // Set up listener for ongoing changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        if (isMounted) {
          setUser(session?.user || null);
          setSessionRestored(true);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Load role when user changes (only after session restored)
  useEffect(() => {
    if (!sessionRestored) {
      return; // Wait for session restoration first
    }

    if (!user) {
      setRole(null);
      setLoading(false); // Session restored, no user
      return;
    }

    // User exists, keep loading until role is fetched
    const loadRole = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error loading role:", error);
          setRole(null);
        } else {
          console.log("Role loaded:", data?.role);
          setRole(data?.role ?? null);
        }
      } catch (err) {
        console.error("Exception loading role:", err);
        setRole(null);
      } finally {
        // Role is loaded, finish loading
        console.log("Auth fully initialized");
        setLoading(false);
      }
    };

    loadRole();
  }, [user, sessionRestored]);

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
