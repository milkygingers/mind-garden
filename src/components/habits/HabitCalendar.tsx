"use client";

/**
 * Habit Calendar Component
 * 
 * A beautiful calendar view showing habit completions
 * with a GitHub-style contribution grid
 */

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  logs: HabitLog[];
}

interface HabitCalendarProps {
  habit: Habit;
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToggleDay: (date: Date) => void;
}

export function HabitCalendar({
  habit,
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onToggleDay,
}: HabitCalendarProps) {
  const { days, monthName, year } = useMemo(() => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startPadding = firstDay.getDay(); // Day of week (0-6)
    
    const daysArray: (Date | null)[] = [];
    
    // Add padding for days before the 1st
    for (let i = 0; i < startPadding; i++) {
      daysArray.push(null);
    }
    
    // Add all days of the month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      daysArray.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d));
    }
    
    return {
      days: daysArray,
      monthName: firstDay.toLocaleDateString("en-US", { month: "long" }),
      year: firstDay.getFullYear(),
    };
  }, [currentMonth]);

  // Create a map of completed dates for quick lookup
  const completedDates = useMemo(() => {
    const map = new Set<string>();
    habit.logs.forEach((log) => {
      if (log.completed) {
        const date = new Date(log.date);
        map.add(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`);
      }
    });
    return map;
  }, [habit.logs]);

  const isCompleted = (date: Date) => {
    return completedDates.has(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isFuture = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  // Calculate streak
  const currentStreak = useMemo(() => {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      if (completedDates.has(`${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`)) {
        streak++;
      } else if (i > 0) {
        // Allow today to be incomplete without breaking streak
        break;
      }
    }
    
    return streak;
  }, [completedDates]);

  // Calculate completion rate for the month
  const monthStats = useMemo(() => {
    const today = new Date();
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const daysToCount = currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear()
      ? today.getDate()
      : daysInMonth;
    
    let completed = 0;
    for (let d = 1; d <= daysToCount; d++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d);
      if (isCompleted(date)) {
        completed++;
      }
    }
    
    return {
      completed,
      total: daysToCount,
      percentage: Math.round((completed / daysToCount) * 100),
    };
  }, [currentMonth, completedDates]);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
      {/* Header */}
      <div 
        className="p-4 border-b border-[var(--border)]"
        style={{ backgroundColor: `${habit.color}15` }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{habit.icon}</span>
            <h3 className="font-semibold text-lg">{habit.name}</h3>
          </div>
          <div 
            className="px-3 py-1 rounded-full text-sm font-medium text-white"
            style={{ backgroundColor: habit.color }}
          >
            🔥 {currentStreak} day streak
          </div>
        </div>
        
        {/* Month navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={onPrevMonth}
            className="p-1 rounded hover:bg-[var(--card-hover)] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-medium">
            {monthName} {year}
          </span>
          <button
            onClick={onNextMonth}
            className="p-1 rounded hover:bg-[var(--card-hover)] transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="p-4">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs text-[var(--muted)] font-medium py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => (
            <button
              key={index}
              disabled={!date || isFuture(date)}
              onClick={() => date && !isFuture(date) && onToggleDay(date)}
              className={`
                aspect-square rounded-lg text-sm font-medium
                transition-all duration-200
                ${!date ? "invisible" : ""}
                ${date && isFuture(date) ? "opacity-30 cursor-not-allowed" : ""}
                ${date && !isFuture(date) ? "hover:scale-110 cursor-pointer" : ""}
                ${date && isToday(date) ? "ring-2 ring-offset-2 ring-offset-[var(--card)]" : ""}
              `}
              style={
                date
                  ? {
                      backgroundColor: isCompleted(date) ? habit.color : "var(--background)",
                      color: isCompleted(date) ? "white" : "var(--foreground)",
                      ...(isToday(date) && { ringColor: habit.color }),
                    }
                  : undefined
              }
            >
              {date?.getDate()}
            </button>
          ))}
        </div>
      </div>

      {/* Stats footer */}
      <div 
        className="px-4 py-3 border-t border-[var(--border)] flex items-center justify-between text-sm"
        style={{ backgroundColor: `${habit.color}08` }}
      >
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[var(--muted)]">This month: </span>
            <span className="font-semibold">{monthStats.completed}/{monthStats.total}</span>
          </div>
          <div>
            <span className="text-[var(--muted)]">Rate: </span>
            <span 
              className="font-semibold"
              style={{ color: monthStats.percentage >= 80 ? habit.color : undefined }}
            >
              {monthStats.percentage}%
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: habit.color }} />
          <span className="text-[var(--muted)]">Completed</span>
        </div>
      </div>
    </div>
  );
}

