// src/components/DarkModeToggle.jsx
import React, { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const storedPref = localStorage.getItem("onebox-theme");
      if (storedPref) return storedPref === "dark";
    }
    if (window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("onebox-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("onebox-theme", "light");
    }
  }, [isDark]);

  const toggle = () => setIsDark((prev) => !prev);

  return (
    <button
      onClick={toggle}
      className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-300"
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      {isDark ? "🌙 Dark Mode" : "🌙 Dark Mode"}
    </button>
  );
}
