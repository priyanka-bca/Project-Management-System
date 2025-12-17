import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function RoleProtectedRoute({ allowedRole, children }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    checkRole();
  }, []);

  const checkRole = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setAllowed(false);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === allowedRole) {
      setAllowed(true);
    } else {
      setAllowed(false);
    }

    setLoading(false);
  };

  if (loading) return <p className="p-6">Checking access...</p>;

  if (!allowed) return <Navigate to="/auth/login" replace />;

  return children;
}
