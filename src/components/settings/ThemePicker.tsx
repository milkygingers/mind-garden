"use client";

/**
 * Theme Picker Component
 * 
 * Beautiful seasonal theme selector with previews
 */

import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { 
  Theme, 
  themes, 
  themesBySeason, 
  seasonInfo, 
  applyTheme,
} from "@/lib/themes";

interface ThemePickerProps {
  currentThemeId: string;
  onThemeChange: (themeId: string) => void;
  isDark: boolean;
}

export function ThemePicker({ currentThemeId, onThemeChange, isDark }: ThemePickerProps) {
  const [selectedSeason, setSelectedSeason] = useState<keyof typeof themesBySeason>("default");

  const handleThemeSelect = (theme: Theme) => {
    applyTheme(theme, isDark);
    onThemeChange(theme.id);
  };

  const seasons = Object.keys(themesBySeason) as Array<keyof typeof themesBySeason>;

  return (
    <div className="space-y-6">
      {/* Season selector */}
      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Choose a Season
        </h3>
        <div className="flex flex-wrap gap-2">
          {seasons.map((season) => {
            const info = seasonInfo[season];
            const isSelected = selectedSeason === season;
            return (
              <button
                key={season}
                onClick={() => setSelectedSeason(season)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                  transition-all duration-200
                  ${isSelected 
                    ? "ring-2 ring-offset-2 ring-[var(--garden-500)] scale-105" 
                    : "hover:scale-105"
                  }
                `}
                style={{
                  backgroundColor: isSelected ? info.color : `${info.color}20`,
                  color: isSelected ? "white" : info.color,
                }}
              >
                <span className="text-lg">{info.icon}</span>
                {info.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Theme cards for selected season */}
      <div>
        <h3 className="text-sm font-medium mb-3">
          {seasonInfo[selectedSeason].icon} {seasonInfo[selectedSeason].name} Themes
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {themesBySeason[selectedSeason].map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isSelected={currentThemeId === theme.id}
              onSelect={() => handleThemeSelect(theme)}
            />
          ))}
        </div>
      </div>

      {/* All themes quick view */}
      <div>
        <h3 className="text-sm font-medium mb-3">All Themes</h3>
        <div className="flex flex-wrap gap-2">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeSelect(theme)}
              className={`
                relative w-12 h-12 rounded-xl overflow-hidden
                transition-all duration-200 hover:scale-110
                ${currentThemeId === theme.id ? "ring-2 ring-offset-2 ring-[var(--garden-500)]" : ""}
              `}
              title={theme.name}
            >
              {/* Mini color preview */}
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                <div style={{ backgroundColor: theme.colors.primary }} />
                <div style={{ backgroundColor: theme.colors.secondary }} />
                <div style={{ backgroundColor: theme.colors.accent1 }} />
                <div style={{ backgroundColor: theme.colors.accent2 }} />
              </div>
              {currentThemeId === theme.id && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Individual theme card with preview
interface ThemeCardProps {
  theme: Theme;
  isSelected: boolean;
  onSelect: () => void;
}

function ThemeCard({ theme, isSelected, onSelect }: ThemeCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`
        relative p-4 rounded-xl border-2 text-left
        transition-all duration-300 hover:scale-[1.02]
        ${isSelected 
          ? "border-[var(--garden-500)] shadow-lg" 
          : "border-[var(--border)] hover:border-[var(--muted)]"
        }
      `}
      style={{ backgroundColor: theme.colors.card }}
    >
      {/* Selected badge */}
      {isSelected && (
        <div 
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: theme.colors.primary }}
        >
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Theme info */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{theme.icon}</span>
        <div>
          <h4 
            className="font-semibold"
            style={{ color: theme.colors.foreground }}
          >
            {theme.name}
          </h4>
          <p 
            className="text-xs"
            style={{ color: theme.colors.muted }}
          >
            {theme.description}
          </p>
        </div>
      </div>

      {/* Color preview */}
      <div className="flex gap-1.5 mb-3">
        {[
          theme.colors.primary,
          theme.colors.secondary,
          theme.colors.accent1,
          theme.colors.accent2,
          theme.colors.accent3,
        ].map((color, i) => (
          <div
            key={i}
            className="w-6 h-6 rounded-full border border-white/20 shadow-sm"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {/* Mini preview of theme */}
      <div 
        className="rounded-lg p-2 border"
        style={{ 
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.border,
        }}
      >
        <div className="flex gap-2">
          {/* Mini sidebar */}
          <div 
            className="w-8 rounded"
            style={{ backgroundColor: theme.colors.card }}
          >
            <div 
              className="h-1.5 m-1 rounded"
              style={{ backgroundColor: theme.colors.primary }}
            />
            <div 
              className="h-1 mx-1 mb-0.5 rounded"
              style={{ backgroundColor: theme.colors.border }}
            />
            <div 
              className="h-1 mx-1 mb-0.5 rounded"
              style={{ backgroundColor: theme.colors.border }}
            />
          </div>
          {/* Mini content */}
          <div className="flex-1">
            <div 
              className="h-1.5 w-12 rounded mb-1"
              style={{ backgroundColor: theme.colors.foreground }}
            />
            <div 
              className="h-1 w-full rounded mb-0.5"
              style={{ backgroundColor: theme.colors.muted, opacity: 0.3 }}
            />
            <div 
              className="h-1 w-3/4 rounded"
              style={{ backgroundColor: theme.colors.muted, opacity: 0.3 }}
            />
          </div>
        </div>
      </div>
    </button>
  );
}

