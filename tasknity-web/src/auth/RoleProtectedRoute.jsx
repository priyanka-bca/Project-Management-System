import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleProtectedRoute({ allowedRole, children }) {
  const { user, role, loading } = useAuth();

  console.log("RoleProtectedRoute check:", { user: user?.id, role, loading });

  // Show loading state while checking session
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">Loading...</p>
          <p className="text-sm text-gray-500 mt-2">Checking your session...</p>
        </div>
      </div>
    );
  }

  // No user = redirect to login
  if (!user) {
    console.log("No user found, redirecting to login");
    return <Navigate to="/auth/login" replace />;
  }

  // User exists but role doesn't match
  if (allowedRole && role !== allowedRole) {
    console.log("Role mismatch. Required:", allowedRole, "Got:", role);
    return <Navigate to="/auth/login" replace />;
  }

  // User authorized
  console.log("User authorized, rendering children");
  return children;
}
