import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Header from './components/Header';
import AdminPanel from './components/AdminPanel';
import TaskBoard from './components/TaskBoard';
import Reports from './components/Reports';
import RoleSwitcher from './components/RoleSwitcher';
import { loadState, saveState } from './utils/storage';
import { initialState } from './data/mockData';

export default function App() {
  const [state, setState] = useState(() => loadState() || initialState);
  const [role, setRole] = useState('admin');

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addGroup = (group) => {
    setState((prev) => ({ ...prev, groups: [...prev.groups, group] }));
  };

  const approveGroup = (id) => {
    setState((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => (g.id === id ? { ...g, approved: true } : g)),
    }));
  };

  const assignLeader = (groupId, leaderId) => {
    setState((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => (g.id === groupId ? { ...g, leaderId } : g)),
    }));
  };

  const addTask = (task) => {
    setState((prev) => ({ ...prev, tasks: [...prev.tasks, task] }));
  };

  const updateTask = (id, patch) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  };

  return (
    <div className="app">
      <Header />
      <nav className="navbar">
        <Link to="/">Admin</Link>
        <Link to="/board">Task Board</Link>
        <Link to="/reports">Reports</Link>
      </nav>
      <RoleSwitcher role={role} setRole={setRole} />
      <Routes>
        <Route path="/" element={<AdminPanel role={role} addGroup={addGroup} approveGroup={approveGroup} assignLeader={assignLeader} groups={state.groups} />} />
        <Route path="/board" element={<TaskBoard role={role} addTask={addTask} updateTask={updateTask} tasks={state.tasks} groups={state.groups} />} />
        <Route path="/reports" element={<Reports state={state} />} />
      </Routes>
    </div>
  );
}
