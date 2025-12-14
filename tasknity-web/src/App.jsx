import { Routes, Route } from "react-router-dom";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import AuthLayout from "./layouts/AuthLayout";
import AppLayout from "./layouts/AppLayout";
import AdminDashboard from "./admin/AdminDashboard";
import LeaderMemberDashboard from "./dashboard/LeaderMemberDashboard";

export default function App() {
  return (
    <Routes>
      {/* AUTH ROUTES */}
      <Route element={<AuthLayout />}>
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />
      </Route>

      {/* PROTECTED APP ROUTES */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/dashboard" element={<LeaderMemberDashboard />} />
      </Route>
    </Routes>
  );
}
