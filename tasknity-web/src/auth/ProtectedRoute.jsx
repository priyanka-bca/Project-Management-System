import { Navigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children, requiredRole }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      const userId = sessionData.session.user.id;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, verified")
        .eq("id", userId)
        .single();

      if (!profile || !profile.verified) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      if (requiredRole && profile.role !== requiredRole) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      setAllowed(true);
      setLoading(false);
    };

    checkAccess();
  }, [requiredRole]);

  if (loading) return <p className="p-6">Checking access...</p>;

  if (!allowed) return <Navigate to="/auth/login" replace />;

  return children;
}
