import React, { useState, useEffect } from "react";

export default function Header() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header className="bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-800 py-4 shadow-md flex justify-between px-8 items-center transition">
      <div>
        <h1 className="text-2xl font-bold">Project Management System</h1>
        <p className="text-sm opacity-75">
          Manage groups • Assign leaders • Track tasks
        </p>
      </div>
      <button
        onClick={() => setDark(!dark)}
        className="bg-indigo-600 dark:bg-yellow-400 text-white dark:text-black px-3 py-1 rounded hover:opacity-90"
      >
        {dark ? "☀️ Light" : "🌙 Dark"}
      </button>
    </header>
  );
}
