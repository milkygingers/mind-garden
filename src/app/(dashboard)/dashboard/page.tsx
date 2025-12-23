"use client";

/**
 * Dashboard Page
 * 
 * Beautiful widgets showing stats, progress, and quick actions
 */

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Leaf,
  FileText,
  Database,
  Target,
  Folder,
  Flame,
  TrendingUp,
  Clock,
  Star,
  Plus,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  Circle,
} from "lucide-react";

interface DashboardStats {
  overview: {
    totalPages: number;
    totalDatabases: number;
    totalFolders: number;
    totalHabits: number;
  };
  today: {
    habitsCompleted: number;
    habitsTotal: number;
    percentage: number;
  };
  streaks: {
    habits: Array<{
      id: string;
      name: string;
      icon: string;
      color: string;
      streak: number;
      completedToday: boolean;
    }>;
    best: {
      name: string;
      icon: string;
      streak: number;
    } | null;
    totalCompletionsThisWeek: number;
  };
  weeklyProgress: Array<{
    date: string;
    day: string;
    completed: number;
    total: number;
    percentage: number;
  }>;
  recentPages: Array<{
    id: string;
    title: string;
    icon: string | null;
    updatedAt: string;
    folderName: string | null;
    folderIcon: string | null;
  }>;
}

const MOTIVATIONAL_QUOTES = [
  { text: "Small steps every day lead to big changes.", author: "Unknown" },
  { text: "Your habits shape your future.", author: "Unknown" },
  { text: "Progress, not perfection.", author: "Unknown" },
  { text: "The best time to start is now.", author: "Unknown" },
  { text: "Consistency is the key to success.", author: "Unknown" },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [quote] = useState(() => 
    MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]
  );

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Get time-based greeting
  const hour = new Date().getHours();
  let greeting = "Good morning";
  let greetingEmoji = "🌅";
  if (hour >= 12 && hour < 17) {
    greeting = "Good afternoon";
    greetingEmoji = "☀️";
  }
  if (hour >= 17) {
    greeting = "Good evening";
    greetingEmoji = "🌙";
  }

  const userName = session?.user?.name?.split(" ")[0] || "there";

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
          <span className="text-4xl">{greetingEmoji}</span>
          <div>
            <h1 className="text-3xl font-bold">
              {greeting}, {userName}!
            </h1>
            <p className="text-[var(--muted)]">
              Here&apos;s your Mind Garden overview
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<FileText className="w-5 h-5" />}
          label="Pages"
          value={stats?.overview.totalPages || 0}
          color="#3b82f6"
          href="/favorites"
        />
        <StatCard
          icon={<Database className="w-5 h-5" />}
          label="Databases"
          value={stats?.overview.totalDatabases || 0}
          color="#8b5cf6"
          href="/databases"
        />
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Habits"
          value={stats?.overview.totalHabits || 0}
          color="#10b981"
          href="/habits"
        />
        <StatCard
          icon={<Folder className="w-5 h-5" />}
          label="Folders"
          value={stats?.overview.totalFolders || 0}
          color="#f59e0b"
        />
      </div>

      {/* Main Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Today's Progress */}
        <div className="lg:col-span-2 bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[var(--garden-500)]" />
            Today&apos;s Progress
          </h2>
          
          {stats && stats.today.habitsTotal > 0 ? (
            <div className="space-y-4">
              {/* Progress ring */}
              <div className="flex items-center gap-6">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="var(--border)"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="var(--garden-500)"
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${(stats.today.percentage / 100) * 352} 352`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">{stats.today.percentage}%</span>
                    <span className="text-xs text-[var(--muted)]">complete</span>
                  </div>
                </div>
                
                <div className="flex-1">
                  <p className="text-lg font-medium mb-1">
                    {stats.today.habitsCompleted} of {stats.today.habitsTotal} habits
                  </p>
                  <p className="text-sm text-[var(--muted)] mb-3">
                    {stats.today.habitsCompleted === stats.today.habitsTotal
                      ? "🎉 All done! Great work!"
                      : `${stats.today.habitsTotal - stats.today.habitsCompleted} remaining`
                    }
                  </p>
                  <Link
                    href="/habits"
                    className="inline-flex items-center gap-1 text-sm text-[var(--garden-500)] hover:underline"
                  >
                    Go to Habits <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Habit checklist */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {stats.streaks.habits.slice(0, 4).map((habit) => (
                  <div
                    key={habit.id}
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      habit.completedToday
                        ? "bg-[var(--garden-500)]/10"
                        : "bg-[var(--background)]"
                    }`}
                  >
                    {habit.completedToday ? (
                      <CheckCircle2 className="w-4 h-4 text-[var(--garden-500)]" />
                    ) : (
                      <Circle className="w-4 h-4 text-[var(--muted)]" />
                    )}
                    <span className="text-sm truncate">
                      {habit.icon} {habit.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-10 h-10 text-[var(--muted)] mx-auto mb-3" />
              <p className="text-[var(--muted)] mb-3">No habits tracked yet</p>
              <Link
                href="/habits"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--garden-500)] text-white rounded-lg hover:bg-[var(--garden-600)] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Habit
              </Link>
            </div>
          )}
        </div>

        {/* Best Streak Widget */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5" />
            Best Streak
          </h2>
          
          {stats?.streaks.best && stats.streaks.best.streak > 0 ? (
            <div className="text-center py-4">
              <span className="text-5xl block mb-2">{stats.streaks.best.icon}</span>
              <p className="text-4xl font-bold mb-1">{stats.streaks.best.streak}</p>
              <p className="text-sm opacity-90">days in a row</p>
              <p className="text-sm mt-2 opacity-75">{stats.streaks.best.name}</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <Flame className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="opacity-75">Start a streak today!</p>
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-sm opacity-75">This week</p>
            <p className="text-2xl font-bold">
              {stats?.streaks.totalCompletionsThisWeek || 0} completions
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Progress Chart & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Chart */}
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--garden-500)]" />
            Weekly Progress
          </h2>
          
          {stats && stats.weeklyProgress.length > 0 ? (
            <div className="flex items-end justify-between h-40 gap-2">
              {stats.weeklyProgress.map((day, index) => {
                const isToday = index === stats.weeklyProgress.length - 1;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-[var(--background)] rounded-t-lg relative" style={{ height: "120px" }}>
                      <div
                        className={`absolute bottom-0 left-0 right-0 rounded-t-lg transition-all duration-500 ${
                          isToday ? "bg-[var(--garden-500)]" : "bg-[var(--garden-500)]/60"
                        }`}
                        style={{ height: `${Math.max(day.percentage, 5)}%` }}
                      />
                    </div>
                    <span className={`text-xs ${isToday ? "font-bold" : "text-[var(--muted)]"}`}>
                      {day.day}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-[var(--muted)]">
              No data yet
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--garden-500)]" />
            Recent Activity
          </h2>
          
          {stats && stats.recentPages.length > 0 ? (
            <div className="space-y-3">
              {stats.recentPages.map((page) => (
                <Link
                  key={page.id}
                  href={`/page/${page.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--card-hover)] transition-colors"
                >
                  <span className="text-xl">{page.icon || "📄"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{page.title}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {page.folderIcon} {page.folderName || "No folder"}
                    </p>
                  </div>
                  <span className="text-xs text-[var(--muted)]">
                    {formatRelativeTime(new Date(page.updatedAt))}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-10 h-10 text-[var(--muted)] mx-auto mb-3" />
              <p className="text-[var(--muted)]">No recent pages</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions & Quote */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--garden-500)]" />
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            <QuickAction
              icon={<Plus className="w-5 h-5" />}
              label="New Page"
              href="/page/new"
              color="#3b82f6"
            />
            <QuickAction
              icon={<Database className="w-5 h-5" />}
              label="New Database"
              href="/databases"
              color="#8b5cf6"
            />
            <QuickAction
              icon={<Target className="w-5 h-5" />}
              label="Track Habit"
              href="/habits"
              color="#10b981"
            />
            <QuickAction
              icon={<Clock className="w-5 h-5" />}
              label="Focus Timer"
              href="/timer"
              color="#ef4444"
            />
          </div>
        </div>

        {/* Motivational Quote */}
        <div className="bg-gradient-to-br from-[var(--garden-500)]/10 to-[var(--garden-500)]/5 rounded-xl border border-[var(--garden-500)]/20 p-6 flex flex-col justify-center">
          <Leaf className="w-8 h-8 text-[var(--garden-500)] mb-4" />
          <blockquote className="text-lg font-medium mb-2">
            &ldquo;{quote.text}&rdquo;
          </blockquote>
          <cite className="text-sm text-[var(--muted)]">— {quote.author}</cite>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon,
  label,
  value,
  color,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-[var(--muted)]">{label}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="p-4 bg-[var(--card)] rounded-xl border border-[var(--border)] hover:shadow-md transition-all"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="p-4 bg-[var(--card)] rounded-xl border border-[var(--border)]">
      {content}
    </div>
  );
}

// Quick Action Button
function QuickAction({
  icon,
  label,
  href,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] hover:border-[var(--muted)] hover:shadow-sm transition-all group"
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform"
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>
      <span className="font-medium text-sm">{label}</span>
    </Link>
  );
}

// Helper function to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  
  return new Date(date).toLocaleDateString();
}
