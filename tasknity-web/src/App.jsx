import { Routes, Route } from "react-router-dom";
import RoleProtectedRoute from "./auth/RoleProtectedRoute";

import Login from "./auth/Login";
import Signup from "./auth/Signup";
import VerifyOtp from "./auth/VerifyOtp";
import AuthLayout from "./layouts/AuthLayout";
import AppLayout from "./layouts/AppLayout";

import AdminAnalytics from "./admin/AdminAnalytics";

import Reports from "./reports/reports";
import AdminDashboard from "./admin/AdminDashboard";
import GroupDetails from "./admin/GroupDetails";

import MemberDashboard from "./dashboard/MemberDashboard";
import LeaderMemberDashboard from "./dashboard/LeaderMemberDashboard";

export default function App() {
  return (
    <Routes>
      {/* AUTH ROUTES */}
      <Route element={<AuthLayout />}>
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/auth/verify" element={<VerifyOtp />} />
      </Route>

      {/* PROTECTED APP ROUTES */}
      <Route element={<AppLayout />}>
        <Route
          path="/"
          element={
            <RoleProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route path="/reports" element={<Reports />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />

        {/* ✅ STEP 4.1 — MEMBER DASHBOARD PAGE */}
        <Route
          path="/member/dashboard"
          element={
            <RoleProtectedRoute allowedRole="member">
              <MemberDashboard />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <RoleProtectedRoute allowedRole="leader">
              <LeaderMemberDashboard />
            </RoleProtectedRoute>
          }
        />

        {/* ✅ STEP 4.2 — GROUP DETAILS PAGE */}
        <Route
          path="/admin/group/:groupId"
          element={
            <RoleProtectedRoute allowedRole="admin">
              <GroupDetails />
            </RoleProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
