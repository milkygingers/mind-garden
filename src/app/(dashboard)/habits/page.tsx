"use client";

/**
 * Habit Tracker Page
 * 
 * Track daily habits with beautiful calendar views
 */

import { useState, useEffect, useCallback } from "react";
import { 
  Plus, 
  Sparkles, 
  Target,
  Flame,
  Trash2,
  X,
  Bell,
  BellOff,
  Clock,
} from "lucide-react";
import { HabitCalendar } from "@/components/habits/HabitCalendar";
import { PRESET_TIMES, formatTime } from "@/lib/notifications";

interface HabitLog {
  id: string;
  date: string;
  completed: boolean;
}

interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  reminderEnabled: boolean;
  reminderTime: string | null;
  logs: HabitLog[];
}

const HABIT_COLORS = [
  "#10b981", // emerald
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

const HABIT_ICONS = [
  "✨", "💪", "📚", "🧘", "💧", "🏃", "😴", "🥗",
  "💊", "🎯", "🧠", "💻", "🎨", "🎵", "✍️", "🌱",
];

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showNewHabit, setShowNewHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitIcon, setNewHabitIcon] = useState("✨");
  const [newHabitColor, setNewHabitColor] = useState(HABIT_COLORS[0]);
  const [newHabitReminder, setNewHabitReminder] = useState(false);
  const [newHabitReminderTime, setNewHabitReminderTime] = useState("09:00");
  const [editingReminder, setEditingReminder] = useState<string | null>(null);

  // Fetch habits
  const fetchHabits = useCallback(async () => {
    try {
      const res = await fetch("/api/habits");
      if (res.ok) {
        const data = await res.json();
        setHabits(data);
      }
    } catch (error) {
      console.error("Failed to fetch habits:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  // Create new habit
  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newHabitName,
          icon: newHabitIcon,
          color: newHabitColor,
          reminderEnabled: newHabitReminder,
          reminderTime: newHabitReminder ? newHabitReminderTime : null,
        }),
      });

      if (res.ok) {
        const habit = await res.json();
        setHabits([...habits, { ...habit, logs: [] }]);
        setNewHabitName("");
        setNewHabitIcon("✨");
        setNewHabitColor(HABIT_COLORS[0]);
        setNewHabitReminder(false);
        setNewHabitReminderTime("09:00");
        setShowNewHabit(false);
      }
    } catch (error) {
      console.error("Failed to create habit:", error);
    }
  };

  // Update habit reminder
  const handleUpdateReminder = async (habitId: string, enabled: boolean, time: string | null) => {
    try {
      const res = await fetch(`/api/habits/${habitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reminderEnabled: enabled,
          reminderTime: time,
        }),
      });

      if (res.ok) {
        setHabits(habits.map((h) =>
          h.id === habitId
            ? { ...h, reminderEnabled: enabled, reminderTime: time }
            : h
        ));
        setEditingReminder(null);
      }
    } catch (error) {
      console.error("Failed to update reminder:", error);
    }
  };

  // Toggle habit completion for a day
  const handleToggleDay = async (habitId: string, date: Date) => {
    try {
      const res = await fetch(`/api/habits/${habitId}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: date.toISOString(),
        }),
      });

      if (res.ok) {
        // Refresh habits to get updated logs
        fetchHabits();
      }
    } catch (error) {
      console.error("Failed to toggle habit:", error);
    }
  };

  // Delete habit
  const handleDeleteHabit = async (habitId: string) => {
    if (!confirm("Delete this habit? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/habits/${habitId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setHabits(habits.filter((h) => h.id !== habitId));
      }
    } catch (error) {
      console.error("Failed to delete habit:", error);
    }
  };

  // Navigate months
  const goToPrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  // Calculate overall stats
  const overallStats = habits.reduce(
    (acc, habit) => {
      const todayStr = new Date().toDateString();
      const completedToday = habit.logs.some(
        (log) => log.completed && new Date(log.date).toDateString() === todayStr
      );
      
      if (completedToday) acc.completedToday++;
      acc.totalStreak += habit.logs.filter((l) => l.completed).length;
      
      return acc;
    },
    { completedToday: 0, totalStreak: 0 }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--garden-500)]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl text-white">
            <Target className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold">Habit Tracker</h1>
        </div>
        <p className="text-[var(--muted)]">
          Build better habits, one day at a time
        </p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Active Habits</p>
              <p className="text-2xl font-bold">{habits.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Completed Today</p>
              <p className="text-2xl font-bold">
                {overallStats.completedToday}/{habits.length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Total Completions</p>
              <p className="text-2xl font-bold">{overallStats.totalStreak}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add habit button */}
      <div className="mb-6">
        <button
          onClick={() => setShowNewHabit(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--garden-500)] hover:bg-[var(--garden-600)] text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Habit
        </button>
      </div>

      {/* New habit form */}
      {showNewHabit && (
        <div className="mb-6 bg-[var(--card)] p-6 rounded-xl border border-[var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Create New Habit</h3>
            <button
              onClick={() => setShowNewHabit(false)}
              className="p-1 hover:bg-[var(--card-hover)] rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleCreateHabit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Habit Name</label>
              <input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="e.g., Drink 8 glasses of water"
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--garden-500)]"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Icon</label>
              <div className="flex flex-wrap gap-2">
                {HABIT_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setNewHabitIcon(icon)}
                    className={`
                      w-10 h-10 rounded-lg text-xl transition-all
                      ${newHabitIcon === icon 
                        ? "bg-[var(--garden-500)] scale-110" 
                        : "bg-[var(--background)] hover:bg-[var(--card-hover)]"
                      }
                    `}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <div className="flex flex-wrap gap-2">
                {HABIT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewHabitColor(color)}
                    className={`
                      w-10 h-10 rounded-lg transition-all
                      ${newHabitColor === color ? "scale-110 ring-2 ring-offset-2 ring-[var(--foreground)]" : ""}
                    `}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Reminder settings */}
            <div className="p-4 bg-[var(--background)] rounded-lg border border-[var(--border)]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[var(--garden-500)]" />
                  <label className="text-sm font-medium">Daily Reminder</label>
                </div>
                <button
                  type="button"
                  onClick={() => setNewHabitReminder(!newHabitReminder)}
                  className={`
                    relative w-12 h-7 rounded-full transition-colors duration-300
                    ${newHabitReminder ? "bg-[var(--garden-500)]" : "bg-gray-300 dark:bg-gray-600"}
                  `}
                >
                  <div
                    className={`
                      absolute top-1 w-5 h-5 bg-white rounded-full shadow-md
                      transition-transform duration-300
                      ${newHabitReminder ? "translate-x-6" : "translate-x-1"}
                    `}
                  />
                </button>
              </div>
              
              {newHabitReminder && (
                <div className="mt-3">
                  <label className="block text-xs text-[var(--muted)] mb-2">Reminder Time</label>
                  <select
                    value={newHabitReminderTime}
                    onChange={(e) => setNewHabitReminderTime(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--garden-500)]"
                  >
                    {PRESET_TIMES.map((time) => (
                      <option key={time.value} value={time.value}>
                        {time.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={!newHabitName.trim()}
                className="px-4 py-2 bg-[var(--garden-500)] hover:bg-[var(--garden-600)] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Habit
              </button>
              <button
                type="button"
                onClick={() => setShowNewHabit(false)}
                className="px-4 py-2 bg-[var(--background)] hover:bg-[var(--card-hover)] border border-[var(--border)] rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Habit calendars */}
      {habits.length === 0 ? (
        <div className="text-center py-16 bg-[var(--card)] rounded-xl border border-[var(--border)]">
          <Target className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No habits yet</h3>
          <p className="text-[var(--muted)] mb-4">
            Start building better habits by creating your first one!
          </p>
          <button
            onClick={() => setShowNewHabit(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--garden-500)] hover:bg-[var(--garden-600)] text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Your First Habit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {habits.map((habit) => (
            <div key={habit.id} className="relative group">
              <HabitCalendar
                habit={habit}
                currentMonth={currentMonth}
                onPrevMonth={goToPrevMonth}
                onNextMonth={goToNextMonth}
                onToggleDay={(date) => handleToggleDay(habit.id, date)}
              />
              
              {/* Action buttons */}
              <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Reminder button */}
                <button
                  onClick={() => setEditingReminder(editingReminder === habit.id ? null : habit.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    habit.reminderEnabled 
                      ? "bg-[var(--garden-500)]/20 text-[var(--garden-500)]" 
                      : "bg-[var(--background)]/80 text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                  title={habit.reminderEnabled ? `Reminder at ${formatTime(habit.reminderTime!)}` : "Set reminder"}
                >
                  {habit.reminderEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                </button>
                
                {/* Delete button */}
                <button
                  onClick={() => handleDeleteHabit(habit.id)}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg"
                  title="Delete habit"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Reminder dropdown */}
              {editingReminder === habit.id && (
                <div className="absolute top-14 right-4 z-10 w-64 p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl animate-fade-in">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[var(--garden-500)]" />
                      <span className="text-sm font-medium">Reminder</span>
                    </div>
                    <button
                      onClick={() => setEditingReminder(null)}
                      className="p-1 hover:bg-[var(--card-hover)] rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Enable reminder</span>
                      <button
                        onClick={() => handleUpdateReminder(
                          habit.id, 
                          !habit.reminderEnabled, 
                          habit.reminderTime || "09:00"
                        )}
                        className={`
                          relative w-10 h-6 rounded-full transition-colors duration-300
                          ${habit.reminderEnabled ? "bg-[var(--garden-500)]" : "bg-gray-300 dark:bg-gray-600"}
                        `}
                      >
                        <div
                          className={`
                            absolute top-1 w-4 h-4 bg-white rounded-full shadow-md
                            transition-transform duration-300
                            ${habit.reminderEnabled ? "translate-x-5" : "translate-x-1"}
                          `}
                        />
                      </button>
                    </div>

                    {habit.reminderEnabled && (
                      <div>
                        <label className="block text-xs text-[var(--muted)] mb-1">Time</label>
                        <select
                          value={habit.reminderTime || "09:00"}
                          onChange={(e) => handleUpdateReminder(habit.id, true, e.target.value)}
                          className="w-full px-2 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--garden-500)]"
                        >
                          {PRESET_TIMES.map((time) => (
                            <option key={time.value} value={time.value}>
                              {time.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quick tips */}
      {habits.length > 0 && (
        <div className="mt-8 p-4 bg-[var(--card)] rounded-xl border border-[var(--border)]">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--garden-500)]" />
            Tips for Building Habits
          </h3>
          <ul className="text-sm text-[var(--muted)] space-y-1">
            <li>• Start small - one habit at a time works best</li>
            <li>• Stack habits - attach new habits to existing routines</li>
            <li>• Don&apos;t break the chain - aim for consistency over perfection</li>
            <li>• Celebrate small wins - every completed day counts!</li>
          </ul>
        </div>
      )}
    </div>
  );
}

