import React from "react";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ session, profile, children }) {
  if (!session) return <Navigate to="/auth/login" replace />;
  if (profile?.role !== "admin") return <Navigate to="/" replace />;
  return children;
}
