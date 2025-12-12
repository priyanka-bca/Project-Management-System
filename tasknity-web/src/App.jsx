import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { supabase } from "./supabase";

import ProtectedRoute from "./auth/ProtectedRoute";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import ForgotPassword from "./auth/ForgotPassword";

import Header from "./components/Header";
import AdminNavbar from "./components/AdminNavbar";

import AdminPanel from "./components/AdminPanel";
import LeaderMemberDashboard from "./components/LeaderMemberDashboard";
import TaskBoard from "./components/TaskBoard";
import Reports from "./components/Reports";

import { loadState, saveState } from "./utils/storage";
import { initialState } from "./data/mockData";

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  const [state, setState] = useState(() => loadState() || initialState);

  useEffect(() => saveState(state), [state]);

  // auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) loadProfile(data.session.user.id);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session?.user?.id) loadProfile(session.user.id);
        else setProfile(null);
      }
    );

    async function loadProfile(uid) {
      let { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .single();

      setProfile(data);
    }

    return () => listener.subscription.unsubscribe();
  }, []);

  const role = profile?.role || "user";

  return (
    <div>
      <Toaster />

      {session && <Header />}
      {session && role === "admin" && <AdminNavbar />}

      <Routes>
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/auth/forgot" element={<ForgotPassword />} />

        <Route
          path="/"
          element={
            <ProtectedRoute session={session}>
              {role === "admin" ? (
                <AdminPanel
                  groups={state.groups}
                  addGroup={(g) =>
                    setState((p) => ({ ...p, groups: [...p.groups, g] }))
                  }
                  approveGroup={(id) =>
                    setState((p) => ({
                      ...p,
                      groups: p.groups.map((g) =>
                        g.id === id ? { ...g, approved: true } : g
                      ),
                    }))
                  }
                  assignLeader={(gid, lid) =>
                    setState((p) => ({
                      ...p,
                      groups: p.groups.map((g) =>
                        g.id === gid ? { ...g, leaderId: lid } : g
                      ),
                    }))
                  }
                />
              ) : (
                <LeaderMemberDashboard
                  role={role}
                  groups={state.groups}
                  tasks={state.tasks}
                />
              )}
            </ProtectedRoute>
          }
        />

        <Route
          path="/board"
          element={
            <ProtectedRoute session={session}>
              <TaskBoard tasks={state.tasks} groups={state.groups} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute session={session}>
              <Reports state={state} />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}
