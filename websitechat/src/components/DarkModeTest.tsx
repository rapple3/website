"use client";

import { useDarkMode } from "@/context/DarkModeContext";

export default function DarkModeTest() {
  const { darkMode } = useDarkMode();
  
  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white dark:bg-black text-black dark:text-white rounded-lg shadow-lg z-50">
      <p>Dark Mode Status: {darkMode ? "ON" : "OFF"}</p>
      <p>HTML Class: {typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? "dark" : "no dark"}</p>
    </div>
  );
} 