import React, { useState } from "react";

export default function TaskCard({ task, updateTask, role }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(task);

  const handleSave = () => {
    updateTask(task.id, form);
    setEditing(false);
  };

  return (
    <div className="task-card">
      {editing ? (
        <>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <input
            type="date"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          />
          <button onClick={handleSave}>💾 Save</button>
        </>
      ) : (
        <>
          <h4>{task.title}</h4>
          <p>{task.description}</p>
          <p>
            <strong>Status:</strong> {task.status}
          </p>
          <p>
            <strong>Deadline:</strong> {task.deadline}
          </p>
          {role !== "member" && (
            <button onClick={() => setEditing(true)}>✏ Edit</button>
          )}
        </>
      )}
    </div>
  );
}
