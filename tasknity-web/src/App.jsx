// src/App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Header from "./components/Header";
import AdminNavbar from "./components/AdminNavbar";
import AdminPanel from "./components/AdminPanel";
import TaskBoard from "./components/TaskBoard";
import Reports from "./components/Reports";
import LeaderMemberDashboard from "./components/LeaderMemberDashboard";

import AdminLogin from "./auth/AdminLogin";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import ForgotPassword from "./auth/ForgotPassword";

import { supabase } from "./supabase";
import ProtectedRoute from "./auth/ProtectedRoute";

import { loadState, saveState } from "./utils/storage";
import { initialState } from "./data/mockData";

export default function App() {
  const [state, setState] = useState(() => loadState() || initialState);

  // For users (Supabase)
  const [session, setSession] = useState(null);

  // For Admin Login
  const [isAdmin, setIsAdmin] = useState(
    localStorage.getItem("isAdmin") === "true"
  );

  // Save data in localStorage
  useEffect(() => saveState(state), [state]);

  // Track Supabase login session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // CRUD Handlers
  const addGroup = (group) => setState((p) => ({ ...p, groups: [...p.groups, group] }));
  const approveGroup = (id) => setState((p) => ({ ...p, groups: p.groups.map(g => g.id === id ? { ...g, approved: true } : g) }));
  const assignLeader = (groupId, leaderId) => setState((p) => ({ ...p, groups: p.groups.map(g => g.id === groupId ? { ...g, leaderId } : g) }));
  const addTask = (task) => setState((p) => ({ ...p, tasks: [...p.tasks, task] }));
  const updateTask = (id, patch) => setState((p) => ({ ...p, tasks: p.tasks.map(t => t.id === id ? { ...t, ...patch } : t) }));

  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    localStorage.setItem("isAdmin", "true");
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem("isAdmin");
  };

  return (
    <div className="app">
      <Toaster position="top-right" />

      {/* Header + Navbar */}
      {(session || isAdmin) && <Header onAdminLogout={handleAdminLogout} />}
      {isAdmin && <AdminNavbar />}

      <Routes>
        {/* Admin Login */}
        <Route
          path="/admin-login"
          element={!isAdmin ? <AdminLogin onSuccess={handleAdminLoginSuccess} /> : <Navigate to="/admin" />}
        />

        {/* User Auth (Supabase) */}
        <Route path="/auth/login" element={!session ? <Login /> : <Navigate to="/" />} />
        <Route path="/auth/signup" element={!session ? <Signup /> : <Navigate to="/" />} />
        <Route path="/auth/forgot" element={<ForgotPassword />} />

        {/* Admin Panel */}
        <Route
          path="/admin"
          element={
            isAdmin ? (
              <AdminPanel
                role="admin"
                groups={state.groups}
                addGroup={addGroup}
                approveGroup={approveGroup}
                assignLeader={assignLeader}
              />
            ) : (
              <Navigate to="/admin-login" />
            )
          }
        />

        {/* User Home */}
        <Route
          path="/"
          element={
            session ? (
              <LeaderMemberDashboard
                role="user"
                groups={state.groups}
                tasks={state.tasks}
                addTask={addTask}
                updateTask={updateTask}
              />
            ) : (
              <Navigate to="/auth/login" />
            )
          }
        />

        {/* TaskBoard */}
        <Route
          path="/board"
          element={
            session ? (
              <TaskBoard
                role="user"
                tasks={state.tasks}
                groups={state.groups}
                addTask={addTask}
                updateTask={updateTask}
              />
            ) : (
              <Navigate to="/auth/login" />
            )
          }
        />

        {/* <Route path="/" element={
          <ProtectedRoute session={session}>
            {profile?.role === "admin" ? <AdminPanel /> : <LeaderMemberDashboard />}
          </ProtectedRoute>
        } />

        <Route path="/reports" element={
          <ProtectedRoute session={session}>
            <AdminRoute profile={profile}>
              <Reports state={state} />
            </AdminRoute>
          </ProtectedRoute>
        } /> */}

        {/* Reports - Only admin */}
        <Route
          path="/reports"
          element={
            isAdmin ? <Reports state={state} /> : <Navigate to="/admin-login" />
          }
        />
      </Routes>
    </div>
  );
}
