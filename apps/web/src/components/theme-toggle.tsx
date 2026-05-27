"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-9 items-center justify-center rounded-full bg-bg-secondary px-3 py-1.5 text-text-secondary transition-all duration-300 hover:bg-bg-glass hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
      aria-label="Toggle theme"
    >
      <div className="relative h-5 w-5 overflow-hidden">
        <Sun
          className={`absolute inset-0 h-5 w-5 transition-transform duration-300 ${
            theme === "dark" ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
          }`}
        />
        <Moon
          className={`absolute inset-0 h-5 w-5 transition-transform duration-300 ${
            theme === "light" ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
          }`}
        />
      </div>
    </button>
  );
}
