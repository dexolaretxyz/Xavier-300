"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Theme, getTheme, setTheme, toggleTheme as toggleThemeBase } from "../lib/theme";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    // Initialize theme on mount to avoid hydration mismatch flashes
    const currentTheme = getTheme();
    setThemeState(currentTheme);
    document.documentElement.setAttribute("data-theme", currentTheme);
  }, []);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    setThemeState(newTheme);
  };

  const handleToggleTheme = () => {
    const nextTheme = toggleThemeBase();
    setThemeState(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, toggleTheme: handleToggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
