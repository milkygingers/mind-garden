"use client";

/**
 * Pomodoro Timer Widget
 * 
 * A beautiful focus timer with:
 * - Work sessions (25 min default)
 * - Short breaks (5 min)
 * - Long breaks (15 min)
 * - Session counter
 * - Sound notifications
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Brain,
  Settings,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

// Timer modes
type TimerMode = "work" | "shortBreak" | "longBreak";

interface TimerSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number; // sessions before long break
}

const DEFAULT_SETTINGS: TimerSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
};

// Colors for each mode
const MODE_COLORS = {
  work: {
    bg: "from-rose-500 to-orange-500",
    text: "text-rose-500",
    ring: "ring-rose-500",
  },
  shortBreak: {
    bg: "from-green-500 to-teal-500",
    text: "text-green-500",
    ring: "ring-green-500",
  },
  longBreak: {
    bg: "from-blue-500 to-indigo-500",
    text: "text-blue-500",
    ring: "ring-blue-500",
  },
};

const MODE_LABELS = {
  work: "Focus Time",
  shortBreak: "Short Break",
  longBreak: "Long Break",
};

const MODE_ICONS = {
  work: Brain,
  shortBreak: Coffee,
  longBreak: Coffee,
};

export function PomodoroTimer() {
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
    // Fallback to a simple beep using Web Audio API
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Get duration for current mode
  const getModeDuration = useCallback((m: TimerMode) => {
    switch (m) {
      case "work": return settings.workDuration * 60;
      case "shortBreak": return settings.shortBreakDuration * 60;
      case "longBreak": return settings.longBreakDuration * 60;
    }
  }, [settings]);

  // Play notification sound
  const playNotification = useCallback(() => {
    if (!soundEnabled) return;
    
    // Try to play audio file, fallback to Web Audio beep
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Fallback: create a beep using Web Audio API
        const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = "sine";
        gainNode.gain.value = 0.3;
        
        oscillator.start();
        setTimeout(() => {
          oscillator.stop();
          audioContext.close();
        }, 200);
      });
    }
  }, [soundEnabled]);

  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    playNotification();
    setIsRunning(false);
    
    if (mode === "work") {
      const newSessions = sessionsCompleted + 1;
      setSessionsCompleted(newSessions);
      
      // Check if it's time for a long break
      if (newSessions % settings.longBreakInterval === 0) {
        setMode("longBreak");
        setTimeLeft(settings.longBreakDuration * 60);
      } else {
        setMode("shortBreak");
        setTimeLeft(settings.shortBreakDuration * 60);
      }
    } else {
      // After break, go back to work
      setMode("work");
      setTimeLeft(settings.workDuration * 60);
    }
  }, [mode, sessionsCompleted, settings, playNotification]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, handleTimerComplete, timeLeft]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate progress percentage
  const progress = ((getModeDuration(mode) - timeLeft) / getModeDuration(mode)) * 100;

  // Control functions
  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getModeDuration(mode));
  };

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(getModeDuration(newMode));
  };

  const updateSetting = (key: keyof TimerSettings, delta: number) => {
    setSettings((prev) => {
      const newValue = Math.max(1, Math.min(60, prev[key] + delta));
      const newSettings = { ...prev, [key]: newValue };
      
      // Update timeLeft if we're changing the current mode's duration
      if (
        (key === "workDuration" && mode === "work") ||
        (key === "shortBreakDuration" && mode === "shortBreak") ||
        (key === "longBreakDuration" && mode === "longBreak")
      ) {
        setTimeLeft(newValue * 60);
      }
      
      return newSettings;
    });
  };

  const ModeIcon = MODE_ICONS[mode];
  const colors = MODE_COLORS[mode];

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Timer Card */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-xl">
        {/* Gradient Header */}
        <div className={`bg-gradient-to-r ${colors.bg} p-6 text-white`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ModeIcon className="w-5 h-5" />
              <span className="font-medium">{MODE_LABELS[mode]}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                title={soundEnabled ? "Mute" : "Unmute"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Ring */}
          <div className="relative w-48 h-48 mx-auto">
            {/* Background circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="white"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 88}
                strokeDashoffset={2 * Math.PI * 88 * (1 - progress / 100)}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            
            {/* Time display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold font-mono tracking-wider">
                {formatTime(timeLeft)}
              </span>
              <span className="text-sm opacity-80 mt-1">
                Session {sessionsCompleted + 1}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6">
          {/* Mode buttons */}
          <div className="flex gap-2 mb-6">
            {(["work", "shortBreak", "longBreak"] as TimerMode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  mode === m
                    ? `${MODE_COLORS[m].text} bg-current/10 ring-2 ${MODE_COLORS[m].ring}`
                    : "text-[var(--muted)] hover:bg-[var(--card-hover)]"
                }`}
              >
                {m === "work" ? "Focus" : m === "shortBreak" ? "Short" : "Long"}
              </button>
            ))}
          </div>

          {/* Play/Pause and Reset */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={resetTimer}
              className="p-3 rounded-full bg-[var(--card-hover)] hover:bg-[var(--border)] transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            
            <button
              onClick={toggleTimer}
              className={`p-5 rounded-full bg-gradient-to-r ${colors.bg} text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all`}
            >
              {isRunning ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </button>
            
            <div className="w-11" /> {/* Spacer for balance */}
          </div>

          {/* Sessions completed */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--muted)]">
              🍅 {sessionsCompleted} {sessionsCompleted === 1 ? "session" : "sessions"} completed today
            </p>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="border-t border-[var(--border)] p-6 bg-[var(--background)] animate-fade-in">
            <h3 className="font-semibold mb-4">Timer Settings</h3>
            
            <div className="space-y-4">
              {/* Work duration */}
              <SettingRow
                label="Focus duration"
                value={settings.workDuration}
                unit="min"
                onIncrease={() => updateSetting("workDuration", 5)}
                onDecrease={() => updateSetting("workDuration", -5)}
              />
              
              {/* Short break */}
              <SettingRow
                label="Short break"
                value={settings.shortBreakDuration}
                unit="min"
                onIncrease={() => updateSetting("shortBreakDuration", 1)}
                onDecrease={() => updateSetting("shortBreakDuration", -1)}
              />
              
              {/* Long break */}
              <SettingRow
                label="Long break"
                value={settings.longBreakDuration}
                unit="min"
                onIncrease={() => updateSetting("longBreakDuration", 5)}
                onDecrease={() => updateSetting("longBreakDuration", -5)}
              />
              
              {/* Long break interval */}
              <SettingRow
                label="Long break after"
                value={settings.longBreakInterval}
                unit="sessions"
                onIncrease={() => updateSetting("longBreakInterval", 1)}
                onDecrease={() => updateSetting("longBreakInterval", -1)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Setting row component
interface SettingRowProps {
  label: string;
  value: number;
  unit: string;
  onIncrease: () => void;
  onDecrease: () => void;
}

function SettingRow({ label, value, unit, onIncrease, onDecrease }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={onDecrease}
          className="p-1 rounded hover:bg-[var(--card-hover)] transition-colors"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
        <span className="w-16 text-center font-medium">
          {value} {unit}
        </span>
        <button
          onClick={onIncrease}
          className="p-1 rounded hover:bg-[var(--card-hover)] transition-colors"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

