import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleProtectedRoute({ allowedRole, children }) {
  const { user, role, loading } = useAuth();

  // ⏳ wait for auth check
  if (loading) {
    return <p className="p-6">Checking access...</p>;
  }

  // 🔒 not logged in
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // ⏳ role still loading
  if (!role) {
    return <p className="p-6">Loading role...</p>;
  }

  // 🚫 role mismatch
  if (allowedRole && role !== allowedRole) {
    if (role === "admin") return <Navigate to="/" replace />;
    if (role === "member") return <Navigate to="/member/dashboard" replace />;
    if (role === "leader") return <Navigate to="/dashboard" replace />;

    return <Navigate to="/auth/login" replace />;
  }

  // ✅ allowed
  return children;
}
