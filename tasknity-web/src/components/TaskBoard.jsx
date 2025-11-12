import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import TaskCard from "./TaskCard";

export default function TaskBoard({ role, tasks, groups, addTask, updateTask }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [groupId, setGroupId] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [deadline, setDeadline] = useState("");

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!title.trim() || !groupId) return;

    const newTask = {
      id: uuidv4(),
      title,
      description: desc,
      groupId,
      assignedTo,
      deadline,
      status: "pending",
    };
    addTask(newTask);

    // reset
    setTitle("");
    setDesc("");
    setGroupId("");
    setAssignedTo("");
    setDeadline("");
  };

  const filteredTasks =
    role === "leader" || role === "member"
      ? tasks.filter((t) =>
          groups.some((g) => g.id === t.groupId && g.leaderId === assignedTo)
        )
      : tasks;

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">
        Task Board
      </h2>

      {role === "admin" || role === "leader" ? (
        <form
          onSubmit={handleAddTask}
          className="bg-white p-4 shadow border rounded-md space-y-4"
        >
          <h3 className="text-lg font-semibold text-gray-700">
            Add New Task
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Task title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border rounded p-2"
                placeholder="Enter task title"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Description</label>
              <input
                type="text"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="border rounded p-2"
                placeholder="Brief task details"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Group</label>
              <select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="border rounded p-2"
                required
              >
                <option value="">Select group</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Assign To</label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="border rounded p-2"
                placeholder="Member name"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="border rounded p-2"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Add Task
          </button>
        </form>
      ) : (
        <p className="text-center text-gray-600">
          Only Admins or Leaders can add new tasks.
        </p>
      )}

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} updateTask={updateTask} />
          ))
        ) : (
          <p className="text-gray-500 col-span-3 text-center">
            No tasks available.
          </p>
        )}
      </div>
    </main>
  );
}
