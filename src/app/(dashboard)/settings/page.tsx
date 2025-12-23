"use client";

/**
 * Settings Page
 * 
 * Customize your Mind Garden with themes and preferences
 */

import { useState, useEffect } from "react";
import { Settings, Palette, Moon, Sun, Sparkles } from "lucide-react";
import { ThemePicker } from "@/components/settings/ThemePicker";
import { getTheme, loadSavedTheme, applyTheme } from "@/lib/themes";

export default function SettingsPage() {
  const [currentThemeId, setCurrentThemeId] = useState("default");
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    setMounted(true);
    const savedThemeId = loadSavedTheme();
    setCurrentThemeId(savedThemeId);
    
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);

    // Apply the saved theme
    const theme = getTheme(savedThemeId);
    applyTheme(theme, isDarkMode);
  }, []);

  const handleThemeChange = (themeId: string) => {
    setCurrentThemeId(themeId);
  };

  const toggleDarkMode = () => {
    const html = document.documentElement;
    html.classList.toggle("dark");
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    // Re-apply current theme with new dark mode setting
    const theme = getTheme(currentThemeId);
    applyTheme(theme, newIsDark);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--garden-500)]" />
      </div>
    );
  }

  const currentTheme = getTheme(currentThemeId);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div 
            className="p-2 rounded-xl text-white"
            style={{ 
              background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})` 
            }}
          >
            <Settings className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        <p className="text-[var(--muted)]">
          Customize your Mind Garden experience
        </p>
      </div>

      {/* Current theme banner */}
      <div 
        className="mb-8 p-6 rounded-2xl border-2 overflow-hidden relative"
        style={{ 
          borderColor: currentTheme.colors.primary,
          background: `linear-gradient(135deg, ${currentTheme.colors.primaryLight}, ${currentTheme.colors.background})`,
        }}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{currentTheme.icon}</span>
            <div>
              <h2 className="text-xl font-bold" style={{ color: currentTheme.colors.primary }}>
                {currentTheme.name}
              </h2>
              <p className="text-sm" style={{ color: currentTheme.colors.muted }}>
                {currentTheme.description}
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            {[
              currentTheme.colors.primary,
              currentTheme.colors.secondary,
              currentTheme.colors.accent1,
              currentTheme.colors.accent2,
              currentTheme.colors.accent3,
            ].map((color, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full shadow-md border-2 border-white"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
        
        {/* Decorative elements */}
        <div 
          className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20"
          style={{ backgroundColor: currentTheme.colors.secondary }}
        />
        <div 
          className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10"
          style={{ backgroundColor: currentTheme.colors.primary }}
        />
      </div>

      {/* Settings sections */}
      <div className="space-y-8">
        {/* Appearance section */}
        <section className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] flex items-center gap-2">
            <Palette className="w-5 h-5 text-[var(--garden-500)]" />
            <h2 className="font-semibold">Appearance</h2>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Dark mode toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isDark ? (
                  <Moon className="w-5 h-5 text-indigo-500" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500" />
                )}
                <div>
                  <h3 className="font-medium">Dark Mode</h3>
                  <p className="text-sm text-[var(--muted)]">
                    {isDark ? "Currently using dark theme" : "Currently using light theme"}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`
                  relative w-14 h-8 rounded-full transition-colors duration-300
                  ${isDark ? "bg-indigo-500" : "bg-gray-300"}
                `}
              >
                <div
                  className={`
                    absolute top-1 w-6 h-6 bg-white rounded-full shadow-md
                    transition-transform duration-300
                    ${isDark ? "translate-x-7" : "translate-x-1"}
                  `}
                />
              </button>
            </div>

            {/* Divider */}
            <hr className="border-[var(--border)]" />

            {/* Theme picker */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[var(--garden-500)]" />
                <h3 className="font-medium">Seasonal Themes</h3>
              </div>
              <ThemePicker
                currentThemeId={currentThemeId}
                onThemeChange={handleThemeChange}
                isDark={isDark}
              />
            </div>
          </div>
        </section>

        {/* Quick tips */}
        <div className="p-4 bg-[var(--card)] rounded-xl border border-[var(--border)]">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color: currentTheme.colors.primary }} />
            Pro Tips
          </h3>
          <ul className="text-sm text-[var(--muted)] space-y-1">
            <li>• Themes are saved automatically and persist between sessions</li>
            <li>• Dark mode works with all seasonal themes</li>
            <li>• The Halloween theme has its own dark atmosphere!</li>
            <li>• Click the moon/sun icon in the sidebar to quickly toggle dark mode</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

