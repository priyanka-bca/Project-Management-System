import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import TaskCard from "./TaskCard";
import { v4 as uuidv4 } from "uuid";

export default function LeaderMemberDashboard({ role, groups, tasks, addTask, updateTask }) {
  const currentUser = role === "leader" ? "Alice" : "Bob";

  const myGroup =
    role === "leader"
      ? groups.find((g) => g.leaderId === currentUser)
      : groups.find((g) => g.members.includes(currentUser));

  const visibleTasks =
    role === "leader"
      ? tasks.filter((t) => t.groupId === myGroup?.id)
      : tasks.filter((t) => t.assignedTo === currentUser);

  const [showModal, setShowModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskDeadline, setTaskDeadline] = useState("");

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskTitle || !taskAssignee) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const newTask = {
      id: uuidv4(),
      title: taskTitle,
      description: taskDesc,
      groupId: myGroup.id,
      assignedTo: taskAssignee,
      deadline: taskDeadline,
      status: "pending",
    };

    addTask(newTask);
    toast.success(`✅ Task "${taskTitle}" assigned to ${taskAssignee}`);

    setTaskTitle("");
    setTaskDesc("");
    setTaskAssignee("");
    setTaskDeadline("");
    setShowModal(false);
  };

  if (!myGroup) {
    return (
      <div className="p-6 text-center text-gray-600">
        <p className="text-lg font-semibold">No group found for you yet.</p>
        <p className="text-sm">Please wait for the Admin to assign one.</p>
      </div>
    );
  }

  return (
    <motion.main
      className="max-w-5xl mx-auto p-6 space-y-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">
        {role === "leader" ? "Leader Dashboard" : "Member Dashboard"}
      </h2>

      {/* Group Info */}
      <div className="bg-white shadow rounded-md p-4 border">
        <p className="text-gray-700 text-lg font-semibold mb-2">
          Group: <span className="text-blue-600">{myGroup.name}</span>
        </p>
        <p className="text-sm text-gray-600 mb-2">
          Members: {myGroup.members.join(", ")}
        </p>
        <p className="text-sm text-gray-600">
          Leader: <span className="font-medium">{myGroup.leaderId}</span>
        </p>
      </div>

      {/* Add Task Button (Leader Only) */}
      {role === "leader" && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          + Add Task
        </motion.button>
      )}

      {/* Task Cards */}
      <div className="grid md:grid-cols-3 gap-4 mt-6">
        {visibleTasks.length > 0 ? (
          visibleTasks.map((task) => (
            <TaskCard key={task.id} task={task} updateTask={updateTask} />
          ))
        ) : (
          <p className="text-gray-500 col-span-3 text-center">
            No tasks assigned yet.
          </p>
        )}
      </div>

      {/* Task Creation Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg p-6 w-96 shadow-lg border space-y-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <h3 className="text-lg font-semibold text-gray-700">
                Create New Task
              </h3>
              <form onSubmit={handleAddTask} className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Task Title *</label>
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full border rounded p-2"
                    placeholder="Enter task title"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    className="w-full border rounded p-2"
                    placeholder="Enter task description"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Assign To *</label>
                  <select
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    className="w-full border rounded p-2"
                    required
                  >
                    <option value="">Select Member</option>
                    {myGroup.members.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Deadline</label>
                  <input
                    type="date"
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                    className="w-full border rounded p-2"
                  />
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
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
      </AnimatePresence>
    </motion.main>
  );
}
