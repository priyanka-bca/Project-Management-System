import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function GroupForm({ addGroup }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [members, setMembers] = useState("");

  const submit = (e) => {
    e.preventDefault();

    addGroup({
      id: crypto.randomUUID(),
      name,
      members: members
        ? members.split(",").map((m) => m.trim())
        : [],
      approved: false,
    });

    setName("");
    setMembers("");
    setOpen(false);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="
          bg-blue-600
          text-white
          px-5
          py-2
          rounded-lg
          hover:bg-blue-700
          active:scale-95
          transition
        "
      >
        {open ? "Close Form" : "+ Create Group"}
      </button>

      {/* Animated Form */}
      <AnimatePresence>
        {open && (
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="
              mt-4
              bg-white
              p-5
              rounded-xl
              border
              shadow-lg
              space-y-4
              max-w-md
            "
          >
            <h3 className="text-lg font-semibold">Create New Group</h3>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Group name"
              required
              className="
                w-full
                border
                rounded
                px-3
                py-2
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            />

            <input
              value={members}
              onChange={(e) => setMembers(e.target.value)}
              placeholder="Members (comma separated)"
              className="
                w-full
                border
                rounded
                px-3
                py-2
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            />

            <button
              type="submit"
              className="
                w-full
                bg-green-600
                text-white
                py-2
                rounded-lg
                hover:bg-green-700
                active:scale-95
                transition
              "
            >
              Create Group
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </>
  );
}
