"use client";

/**
 * Color Picker Component
 * 
 * A beautiful color palette for customizing folders and pages.
 * Includes preset colors organized by mood/category.
 */

import { Check, Palette } from "lucide-react";

// Beautiful color palette organized by category
export const COLOR_PALETTE = {
  // Nature
  forest: "#22c55e",
  sage: "#84cc16",
  mint: "#10b981",
  teal: "#14b8a6",
  
  // Ocean
  sky: "#0ea5e9",
  blue: "#3b82f6",
  indigo: "#6366f1",
  violet: "#8b5cf6",
  
  // Sunset
  rose: "#f43f5e",
  pink: "#ec4899",
  coral: "#f97316",
  amber: "#f59e0b",
  
  // Earth
  brown: "#a16207",
  stone: "#78716c",
  slate: "#64748b",
  zinc: "#71717a",
};

// Friendly names for colors
export const COLOR_NAMES: Record<string, string> = {
  "#22c55e": "Forest",
  "#84cc16": "Sage",
  "#10b981": "Mint",
  "#14b8a6": "Teal",
  "#0ea5e9": "Sky",
  "#3b82f6": "Blue",
  "#6366f1": "Indigo",
  "#8b5cf6": "Violet",
  "#f43f5e": "Rose",
  "#ec4899": "Pink",
  "#f97316": "Coral",
  "#f59e0b": "Amber",
  "#a16207": "Brown",
  "#78716c": "Stone",
  "#64748b": "Slate",
  "#71717a": "Zinc",
};

interface ColorPickerProps {
  selectedColor: string | null;
  onColorSelect: (color: string | null) => void;
  showLabel?: boolean;
}

export function ColorPicker({ 
  selectedColor, 
  onColorSelect,
  showLabel = true 
}: ColorPickerProps) {
  const colors = Object.values(COLOR_PALETTE);

  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <Palette className="w-4 h-4" />
          <span>Color</span>
        </div>
      )}
      
      <div className="grid grid-cols-8 gap-1.5">
        {/* No color option */}
        <button
          onClick={() => onColorSelect(null)}
          className={`w-7 h-7 rounded-lg border-2 transition-all flex items-center justify-center ${
            selectedColor === null
              ? "border-[var(--foreground)] scale-110"
              : "border-[var(--border)] hover:border-[var(--muted)]"
          }`}
          title="No color"
        >
          {selectedColor === null && (
            <Check className="w-4 h-4" />
          )}
        </button>

        {/* Color options */}
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onColorSelect(color)}
            className={`w-7 h-7 rounded-lg border-2 transition-all flex items-center justify-center ${
              selectedColor === color
                ? "border-[var(--foreground)] scale-110"
                : "border-transparent hover:scale-105"
            }`}
            style={{ backgroundColor: color }}
            title={COLOR_NAMES[color] || color}
          >
            {selectedColor === color && (
              <Check className="w-4 h-4 text-white drop-shadow-md" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Inline color dot for displaying in lists
interface ColorDotProps {
  color: string | null;
  size?: "sm" | "md" | "lg";
}

export function ColorDot({ color, size = "md" }: ColorDotProps) {
  if (!color) return null;
  
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <span
      className={`${sizeClasses[size]} rounded-full inline-block flex-shrink-0`}
      style={{ backgroundColor: color }}
    />
  );
}

// Color badge for folder/page headers
interface ColorBadgeProps {
  color: string | null;
  children: React.ReactNode;
}

export function ColorBadge({ color, children }: ColorBadgeProps) {
  if (!color) {
    return <>{children}</>;
  }

  return (
    <span
      className="px-2 py-0.5 rounded-md text-white font-medium"
      style={{ backgroundColor: color }}
    >
      {children}
    </span>
  );
}

