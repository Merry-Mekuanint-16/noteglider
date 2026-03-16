"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("light-theme", savedTheme === "light");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("light-theme", newTheme === "light");
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-20 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110"
      style={{
        backgroundColor: theme === "dark" ? "#1a1610" : "#ffffff",
        border: `1px solid ${theme === "dark" ? "rgba(232, 168, 73, 0.3)" : "#e8dcc8"}`,
      }}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" style={{ color: "#e8a849" }} />
      ) : (
        <Moon className="h-5 w-5" style={{ color: "#b8944d" }} />
      )}
    </button>
  );
}
