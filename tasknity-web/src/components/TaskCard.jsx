import React, { useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function TaskCard({ task, updateTask }) {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(task.status);
  const [hovered, setHovered] = useState(false);

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    updateTask(task.id, { status: newStatus });

    if (newStatus === "completed") {
      toast.success(`✅ "${task.title}" marked as completed!`);
    } else if (newStatus === "in-progress") {
      toast(`⚙️ "${task.title}" is now in progress.`, { icon: "🚧" });
    } else {
      toast(`🕓 "${task.title}" set to pending.`, { icon: "⏳" });
    }
  };


  const statusColor = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
    "in-progress": "bg-blue-100 text-blue-700 border-blue-300",
    completed: "bg-green-100 text-green-700 border-green-300",
  }[status];

  return (
    <motion.div
      className={`bg-white p-4 rounded-xl border shadow-sm hover:shadow-xl transition relative overflow-hidden ${hovered ? "scale-[1.02]" : ""
        }`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Animated bar */}
      <motion.div
        layoutId="status-bar"
        className={`absolute left-0 top-0 h-1 w-full transition-all duration-500 ${status === "completed"
          ? "bg-green-500"
          : status === "in-progress"
            ? "bg-blue-500"
            : "bg-yellow-400"
          }`}
      />

      {/* Task title and description */}
      <div className="mt-2 space-y-1">
        <h4 className="font-semibold text-gray-800 text-lg">
          {task.title}
        </h4>
        <p className="text-sm text-gray-600">{task.description}</p>
      </div>

      {/* Task meta details */}
      <div className="mt-3 text-sm text-gray-700 space-y-1">
        <p>
          <span className="font-medium">Status:</span>{" "}
          <span
            className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full border ${statusColor}`}
          >
            {status.replace("-", " ")}
          </span>
        </p>

        <select
          value={status}
          onChange={handleStatusChange}
          className="border rounded-md p-1 text-sm mt-1"
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <p>
          <span className="font-medium">Deadline:</span>{" "}
          {task.deadline || "Not set"}
        </p>

        {task.assignedTo && (
          <p>
            <span className="font-medium">Assigned To:</span>{" "}
            {task.assignedTo}
          </p>
        )}
      </div>

      {/* Edit button */}
      <div className="mt-3">
        <button
          onClick={() => setEditing(!editing)}
          className="text-orange-600 text-sm hover:text-orange-700 transition flex items-center gap-1"
        >
          ✏️ Edit
        </button>
      </div>

      {/* Smooth edit area */}
      <AnimatePresence>
        {editing && (
          <motion.div
            className="mt-3 space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <textarea
              className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-400"
              rows="2"
              defaultValue={task.description}
              onBlur={(e) => {
                updateTask(task.id, { description: e.target.value });
                setEditing(false);
              }}
              autoFocus
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
