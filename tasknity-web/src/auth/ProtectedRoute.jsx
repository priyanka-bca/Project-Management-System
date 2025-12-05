import { Navigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function ProtectedRoute({ children }) {
  const session = supabase.auth.getSession();

  if (!session) return <Navigate to="/login" />;
  return children;
}
