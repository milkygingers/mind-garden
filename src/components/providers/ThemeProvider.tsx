"use client";

/**
 * Theme Provider Component
 * 
 * Loads and applies the saved theme on app initialization
 */

import { useEffect } from "react";
import { getTheme, loadSavedTheme, applyTheme } from "@/lib/themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Load saved theme on mount
    const savedThemeId = loadSavedTheme();
    const theme = getTheme(savedThemeId);
    const isDark = document.documentElement.classList.contains("dark");
    
    // Apply the theme
    applyTheme(theme, isDark);
  }, []);

  return <>{children}</>;
}

