import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { ChevronDown, CheckCircle } from "lucide-react";

export default function GroupList({ groups, approveGroup, assignLeader }) {
  const [openId, setOpenId] = useState(null);
  const [approvedMap, setApprovedMap] = useState({});

  if (!groups.length) {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-gray-600 bg-white p-6 rounded-xl border shadow"
      >
        No groups created yet.
      </motion.p>
    );
  }

  const handleApprove = async (group) => {
    setApprovedMap((p) => ({ ...p, [group.id]: true })); // optimistic
    approveGroup(group.id);
    toast.success(`Group "${group.name}" approved`);
  };

  return (
    <motion.div layout className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">
        Existing Groups
      </h3>

      <AnimatePresence>
        {groups.map((g) => {
          const isOpen = openId === g.id;
          const approved = approvedMap[g.id] ?? g.approved;

          return (
            <motion.div
              key={g.id}
              layout
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              className={`rounded-2xl border shadow-sm transition
                ${approved ? "bg-green-50 border-green-200" : "bg-white"}
              `}
            >
              {/* Header */}
              <div
                className="p-5 cursor-pointer flex justify-between items-center"
                onClick={() => setOpenId(isOpen ? null : g.id)}
              >
                <div>
                  <p className="text-lg font-semibold">
                    {g.name}
                  </p>

                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium
                      ${
                        approved
                          ? "bg-green-200 text-green-700"
                          : "bg-yellow-200 text-yellow-700 animate-pulse"
                      }`}
                  >
                    {approved ? "Approved" : "Pending"}
                  </span>
                </div>

                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                >
                  <ChevronDown />
                </motion.div>
              </div>

              {/* Body */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-5 pb-5 space-y-4"
                  >
                    <p className="text-sm text-gray-600">
                      Members:{" "}
                      {g.members.length
                        ? g.members.join(", ")
                        : "No members"}
                    </p>

                    <div className="flex flex-wrap gap-3">
                      {!approved && (
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleApprove(g)}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl shadow hover:shadow-lg"
                        >
                          <CheckCircle size={16} />
                          Approve Group
                        </motion.button>
                      )}

                      <select
                        defaultValue={g.leaderId || ""}
                        onChange={(e) => {
                          assignLeader(g.id, e.target.value);
                          toast.success(`Leader assigned to ${g.name}`);
                        }}
                        className="border rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500"
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
                      <p className="text-sm">
                        Leader:{" "}
                        <span className="font-semibold">
                          {g.leaderId}
                        </span>
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
