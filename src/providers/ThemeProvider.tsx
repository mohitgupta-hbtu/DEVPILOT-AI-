import React, { useState, useEffect } from "react";
import { ThemeContext } from "@/contexts/ThemeContext";
import { storageService } from "@/services";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // Load initial preference from Storage Service
    const settings = storageService.getSettings();
    if (settings.theme) {
      setThemeState(settings.theme);
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  const setTheme = (newTheme: "dark" | "light") => {
    // For now, only dark mode is active per user requirements
    if (newTheme !== "dark") return;

    setThemeState(newTheme);
    const settings = storageService.getSettings();
    storageService.saveSettings({ ...settings, theme: newTheme });
  };

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
