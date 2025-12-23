/**
 * Seasonal Themes for Mind Garden
 * 
 * Each theme has a unique color palette that transforms the entire app
 */

export interface Theme {
  id: string;
  name: string;
  season: "spring" | "summer" | "fall" | "winter" | "default";
  icon: string;
  description: string;
  colors: {
    // Primary accent color
    primary: string;
    primaryHover: string;
    primaryLight: string;
    
    // Secondary accent
    secondary: string;
    
    // Background colors
    background: string;
    backgroundAlt: string;
    
    // Card/surface colors
    card: string;
    cardHover: string;
    
    // Border colors
    border: string;
    
    // Text colors
    foreground: string;
    muted: string;
    
    // Special accents
    accent1: string;
    accent2: string;
    accent3: string;
  };
}

export const themes: Theme[] = [
  // ============================================
  // DEFAULT
  // ============================================
  {
    id: "default",
    name: "Mind Garden",
    season: "default",
    icon: "🌱",
    description: "The classic green theme",
    colors: {
      primary: "#10b981",
      primaryHover: "#059669",
      primaryLight: "#d1fae5",
      secondary: "#6ee7b7",
      background: "#ffffff",
      backgroundAlt: "#f9fafb",
      card: "#ffffff",
      cardHover: "#f3f4f6",
      border: "#e5e7eb",
      foreground: "#111827",
      muted: "#6b7280",
      accent1: "#34d399",
      accent2: "#a7f3d0",
      accent3: "#065f46",
    },
  },

  // ============================================
  // SPRING - Pastel Dreams
  // ============================================
  {
    id: "spring-pastel",
    name: "Pastel Dreams",
    season: "spring",
    icon: "🌸",
    description: "Soft pastels for a fresh start",
    colors: {
      primary: "#f9a8d4",      // Pink
      primaryHover: "#f472b6",
      primaryLight: "#fce7f3",
      secondary: "#c4b5fd",    // Lavender
      background: "#fefefe",
      backgroundAlt: "#fdf4ff",
      card: "#ffffff",
      cardHover: "#fdf2f8",
      border: "#f3e8ff",
      foreground: "#4c1d95",
      muted: "#a78bfa",
      accent1: "#a5f3fc",      // Mint
      accent2: "#fef08a",      // Soft yellow
      accent3: "#bbf7d0",      // Soft green
    },
  },

  // ============================================
  // SUMMER - Tropical Paradise
  // ============================================
  {
    id: "summer-tropical",
    name: "Tropical Paradise",
    season: "summer",
    icon: "🌴",
    description: "Vibrant tropical vibes",
    colors: {
      primary: "#f97316",      // Orange
      primaryHover: "#ea580c",
      primaryLight: "#ffedd5",
      secondary: "#22d3ee",    // Cyan
      background: "#fffbeb",
      backgroundAlt: "#fef3c7",
      card: "#ffffff",
      cardHover: "#fef9c3",
      border: "#fde68a",
      foreground: "#1e3a5f",
      muted: "#0891b2",
      accent1: "#4ade80",      // Palm green
      accent2: "#fb7185",      // Hibiscus pink
      accent3: "#fbbf24",      // Sunshine
    },
  },
  {
    id: "summer-beach",
    name: "Beach Day",
    season: "summer",
    icon: "🏖️",
    description: "Turquoise, yellow & pink",
    colors: {
      primary: "#06b6d4",      // Turquoise
      primaryHover: "#0891b2",
      primaryLight: "#cffafe",
      secondary: "#ec4899",    // Hot pink
      background: "#f0fdfa",
      backgroundAlt: "#ecfeff",
      card: "#ffffff",
      cardHover: "#f0fdfa",
      border: "#a5f3fc",
      foreground: "#164e63",
      muted: "#0e7490",
      accent1: "#fde047",      // Yellow
      accent2: "#f472b6",      // Pink
      accent3: "#2dd4bf",      // Teal
    },
  },

  // ============================================
  // FALL - Neon Halloween
  // ============================================
  {
    id: "fall-halloween",
    name: "Neon Halloween",
    season: "fall",
    icon: "🎃",
    description: "Spooky neon colors",
    colors: {
      primary: "#f97316",      // Neon orange
      primaryHover: "#ea580c",
      primaryLight: "#431407",
      secondary: "#a855f7",    // Neon purple
      background: "#0a0a0a",
      backgroundAlt: "#171717",
      card: "#1c1c1c",
      cardHover: "#262626",
      border: "#404040",
      foreground: "#fafafa",
      muted: "#a3a3a3",
      accent1: "#22c55e",      // Neon green
      accent2: "#facc15",      // Neon yellow
      accent3: "#c026d3",      // Neon magenta
    },
  },
  {
    id: "fall-autumn",
    name: "Autumn Harvest",
    season: "fall",
    icon: "🍂",
    description: "Warm autumn colors",
    colors: {
      primary: "#dc2626",      // Deep red
      primaryHover: "#b91c1c",
      primaryLight: "#fef2f2",
      secondary: "#d97706",    // Amber
      background: "#fffbeb",
      backgroundAlt: "#fef3c7",
      card: "#ffffff",
      cardHover: "#fefce8",
      border: "#fde68a",
      foreground: "#451a03",
      muted: "#92400e",
      accent1: "#ea580c",      // Orange
      accent2: "#854d0e",      // Brown
      accent3: "#65a30d",      // Olive
    },
  },

  // ============================================
  // WINTER - Christmas
  // ============================================
  {
    id: "winter-christmas",
    name: "Christmas Magic",
    season: "winter",
    icon: "🎄",
    description: "Classic red, green & cream",
    colors: {
      primary: "#dc2626",      // Christmas red
      primaryHover: "#b91c1c",
      primaryLight: "#fef2f2",
      secondary: "#16a34a",    // Christmas green
      background: "#fefdfb",   // Cream white
      backgroundAlt: "#faf5f0",
      card: "#fffefa",
      cardHover: "#fef7ed",
      border: "#e7e0d8",
      foreground: "#1c1917",
      muted: "#78716c",
      accent1: "#15803d",      // Pine green
      accent2: "#fef3c7",      // Gold/cream
      accent3: "#991b1b",      // Deep red
    },
  },
  {
    id: "winter-wonderland",
    name: "Winter Wonderland",
    season: "winter",
    icon: "❄️",
    description: "Icy blues & soft whites",
    colors: {
      primary: "#3b82f6",      // Blue
      primaryHover: "#2563eb",
      primaryLight: "#dbeafe",
      secondary: "#0ea5e9",    // Sky blue
      background: "#f8fafc",
      backgroundAlt: "#f1f5f9",
      card: "#ffffff",
      cardHover: "#f1f5f9",
      border: "#cbd5e1",
      foreground: "#0f172a",
      muted: "#64748b",
      accent1: "#38bdf8",      // Light blue
      accent2: "#e2e8f0",      // Ice/cream
      accent3: "#1e40af",      // Dark blue
    },
  },
];

// Group themes by season for the picker
export const themesBySeason = {
  default: themes.filter((t) => t.season === "default"),
  spring: themes.filter((t) => t.season === "spring"),
  summer: themes.filter((t) => t.season === "summer"),
  fall: themes.filter((t) => t.season === "fall"),
  winter: themes.filter((t) => t.season === "winter"),
};

export const seasonInfo = {
  default: { name: "Default", icon: "🌱", color: "#10b981" },
  spring: { name: "Spring", icon: "🌸", color: "#f9a8d4" },
  summer: { name: "Summer", icon: "☀️", color: "#f97316" },
  fall: { name: "Fall", icon: "🍂", color: "#dc2626" },
  winter: { name: "Winter", icon: "❄️", color: "#3b82f6" },
};

// Get a theme by ID
export function getTheme(id: string): Theme {
  return themes.find((t) => t.id === id) || themes[0];
}

// Apply theme to document
export function applyTheme(theme: Theme, isDark: boolean) {
  const root = document.documentElement;
  const colors = theme.colors;

  // For dark mode, we adjust some colors
  if (isDark && theme.id !== "fall-halloween") {
    // Halloween theme is already dark
    root.style.setProperty("--background", "#0a0a0a");
    root.style.setProperty("--background-alt", "#171717");
    root.style.setProperty("--card", "#1c1c1c");
    root.style.setProperty("--card-hover", "#262626");
    root.style.setProperty("--border", "#404040");
    root.style.setProperty("--foreground", "#fafafa");
    root.style.setProperty("--muted", "#a3a3a3");
  } else {
    root.style.setProperty("--background", colors.background);
    root.style.setProperty("--background-alt", colors.backgroundAlt);
    root.style.setProperty("--card", colors.card);
    root.style.setProperty("--card-hover", colors.cardHover);
    root.style.setProperty("--border", colors.border);
    root.style.setProperty("--foreground", colors.foreground);
    root.style.setProperty("--muted", colors.muted);
  }

  // These colors stay the same regardless of dark mode
  root.style.setProperty("--garden-500", colors.primary);
  root.style.setProperty("--garden-600", colors.primaryHover);
  root.style.setProperty("--garden-100", colors.primaryLight);
  root.style.setProperty("--secondary", colors.secondary);
  root.style.setProperty("--accent-1", colors.accent1);
  root.style.setProperty("--accent-2", colors.accent2);
  root.style.setProperty("--accent-3", colors.accent3);

  // Store theme preference
  localStorage.setItem("mind-garden-theme", theme.id);
}

// Load saved theme
export function loadSavedTheme(): string {
  if (typeof window === "undefined") return "default";
  return localStorage.getItem("mind-garden-theme") || "default";
}

