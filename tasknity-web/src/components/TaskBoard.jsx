import React, { useState } from "react";
import { motion } from "framer-motion";
import TaskCard from "./TaskCard";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";

export default function TaskBoard({ role, tasks, groups, addTask, updateTask }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    groupId: "",
    assignedTo: "",
    deadline: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title || !formData.groupId) {
      toast.error("Please fill in all required fields.");
      return;
    }

    addTask({
      id: uuidv4(),
      ...formData,
      status: "pending",
    });

    toast.success("Task created successfully! 🎉");

    setFormData({
      title: "",
      description: "",
      groupId: "",
      assignedTo: "",
      deadline: "",
    });
    setShowForm(false);
  };

  const groupedTasks = {
    pending: tasks.filter((t) => t.status === "pending"),
    inProgress: tasks.filter((t) => t.status === "in-progress"),
    completed: tasks.filter((t) => t.status === "completed"),
  };

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Task Board</h2>

        {(role === "admin" || role === "leader") && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Add Task
          </motion.button>
        )}
      </div>

      {/* New Clean Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PENDING */}
        <TaskColumn
          title="Pending Tasks"
          color="border-yellow-500"
          tasks={groupedTasks.pending}
          updateTask={updateTask}
        />

        {/* IN PROGRESS */}
        <TaskColumn
          title="In Progress"
          color="border-blue-500"
          tasks={groupedTasks.inProgress}
          updateTask={updateTask}
        />

        {/* COMPLETED */}
        <TaskColumn
          title="Completed"
          color="border-green-600"
          tasks={groupedTasks.completed}
          updateTask={updateTask}
        />
      </div>

      {/* Add Task Modal */}
      {showForm && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-white rounded-lg p-6 w-96 shadow-xl"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            <h3 className="text-lg font-bold mb-4">Create New Task</h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                className="w-full p-2 border rounded"
                placeholder="Task Title *"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />

              <textarea
                className="w-full p-2 border rounded"
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />

              <select
                className="w-full p-2 border rounded"
                value={formData.groupId}
                onChange={(e) =>
                  setFormData({ ...formData, groupId: e.target.value })
                }
                required
              >
                <option value="">Select Group *</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>

              <input
                className="w-full p-2 border rounded"
                placeholder="Assign To (optional)"
                value={formData.assignedTo}
                onChange={(e) =>
                  setFormData({ ...formData, assignedTo: e.target.value })
                }
              />

              <input
                type="date"
                className="w-full p-2 border rounded"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
              />

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Task
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </main>
  );
}

// Reusable Column Component
function TaskColumn({ title, color, tasks, updateTask }) {
  return (
    <div className={`bg-white rounded-lg shadow p-4 border-t-4 ${color}`}>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>

      <div className="space-y-4">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} updateTask={updateTask} />
          ))
        ) : (
          <p className="text-gray-500 text-sm">No tasks here yet.</p>
        )}
      </div>
    </div>
  );
}
