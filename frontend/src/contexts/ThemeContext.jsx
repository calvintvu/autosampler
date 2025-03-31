"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [volume, setVolume] = useState(100); // Default volume at 75%

  // Initialize theme and settings from localStorage on mount
  useEffect(() => {
    // Load theme setting
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    // Load volume setting
    const savedVolume = localStorage.getItem("volume");
    if (savedVolume) {
      setVolume(Number.parseInt(savedVolume, 10));
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => {
      const newMode = !prevMode;

      // Save to localStorage
      localStorage.setItem("theme", newMode ? "dark" : "light");

      // Toggle class on html element
      if (newMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      return newMode;
    });
  };

  // Update volume
  const updateVolume = (newVolume) => {
    setVolume(newVolume);
    localStorage.setItem("volume", newVolume.toString());

    // Dispatch a custom event that WaveSurfer instances can listen for
    window.dispatchEvent(
      new CustomEvent("app-volume-change", { detail: { volume: newVolume } })
    );
  };

  return (
    <AppContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        volume,
        updateVolume,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}

// For backward compatibility
export const ThemeProvider = AppProvider;
export const useTheme = useAppContext;
