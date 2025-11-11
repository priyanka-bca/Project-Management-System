import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import TaskCard from "./TaskCard";

export default function TaskBoard({ role, addTask, updateTask, tasks, groups }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [groupId, setGroupId] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [deadline, setDeadline] = useState("");

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!title.trim() || !groupId) return;

    const newTask = {
      id: uuidv4(),
      title,
      description,
      groupId,
      assignedTo,
      status: "todo",
      deadline,
    };

    addTask(newTask);
    setTitle("");
    setDescription("");
    setGroupId("");
    setAssignedTo("");
    setDeadline("");
  };

  // filter tasks for selected group (leaders/members)
  const visibleTasks =
    role === "admin"
      ? tasks
      : tasks.filter((t) =>
          groups.some(
            (g) =>
              g.id === t.groupId &&
              ((role === "leader" && g.leaderId === assignedTo) ||
                (role === "member" && g.members.includes(assignedTo)))
          )
        );

  return (
    <main>
      <div className="card">
        <h3>Task Board</h3>

        {role !== "member" && (
          <form onSubmit={handleAddTask} className="add-task-form">
            <input
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <label>Group:</label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              required
            >
              <option value="">Select Group</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>

            <label>Assign To:</label>
            <input
              placeholder="Member name"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            />

            <label>Deadline:</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />

            <button type="submit">➕ Add Task</button>
          </form>
        )}
      </div>

      <div className="task-list">
        {tasks.length === 0 ? (
          <p>No tasks available.</p>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} updateTask={updateTask} role={role} />
          ))
        )}
      </div>
    </main>
  );
}
