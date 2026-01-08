import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleProtectedRoute({ allowedRole, children }) {
  const { user, role, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/auth/login" replace />;
  if (allowedRole && role !== allowedRole)
    return <Navigate to="/auth/login" replace />;

  return children;
}
