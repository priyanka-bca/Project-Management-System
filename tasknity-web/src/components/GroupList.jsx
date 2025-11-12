import React from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function GroupList({ groups, approveGroup, assignLeader }) {
  if (!groups.length)
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-gray-600 text-center"
      >
        No groups created yet.
      </motion.p>
    );

  return (
    <div className="bg-white p-4 shadow rounded-md border">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        Existing Groups
      </h3>

      <ul className="space-y-4">
        <AnimatePresence>
          {groups.map((g) => (
            <motion.li
              key={g.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 border rounded-md bg-gray-50 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-center">
                <p className="font-semibold text-gray-800">
                  {g.name}{" "}
                  {g.approved ? (
                    <span className="text-green-600 text-sm">(Approved)</span>
                  ) : (
                    <span className="text-yellow-600 text-sm">(Pending)</span>
                  )}
                </p>
              </div>

              <p className="text-sm text-gray-600">
                Members: {g.members.join(", ") || "None"}
              </p>

              <div className="flex gap-3 mt-3">
                {!g.approved && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      approveGroup(g.id);
                      toast.success(`✅ "${g.name}" has been approved!`);
                    }}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm transition"
                  >
                    Approve
                  </motion.button>
                )}

                <select
                  onChange={(e) => {
                    assignLeader(g.id, e.target.value);
                    if (e.target.value) {
                      toast(`👑 ${e.target.value} assigned as leader of "${g.name}"`, {
                        icon: "🎯",
                      });
                    }
                  }}
                  className="border p-1 rounded text-sm"
                  defaultValue={g.leaderId || ""}
                >
                  <option value="">Assign Leader</option>
                  {g.members.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {g.leaderId && (
                <p className="text-sm text-gray-700 mt-2">
                  Leader:{" "}
                  <span className="font-medium text-blue-700">
                    {g.leaderId}
                  </span>
                </p>
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
