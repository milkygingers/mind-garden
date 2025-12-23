/**
 * Dashboard Stats API Route
 * 
 * GET /api/dashboard/stats - Get aggregated stats for dashboard widgets
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Fetch all data in parallel
    const [
      habits,
      pages,
      databases,
      folders,
      recentPages,
    ] = await Promise.all([
      // Habits with logs
      db.habit.findMany({
        where: { userId, isArchived: false },
        include: {
          logs: {
            where: { date: { gte: weekAgo } },
            orderBy: { date: "desc" },
          },
        },
      }),
      // Total pages count
      db.page.count({ where: { userId } }),
      // Total databases count
      db.database.count({ where: { userId } }),
      // Total folders count
      db.folder.count({ where: { userId } }),
      // Recent pages
      db.page.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          icon: true,
          updatedAt: true,
          folder: { select: { name: true, icon: true } },
        },
      }),
    ]);

    // Calculate habit stats
    const todayStr = today.toDateString();
    const habitsCompletedToday = habits.filter((h) =>
      h.logs.some((log) => log.completed && new Date(log.date).toDateString() === todayStr)
    ).length;

    // Calculate streaks for each habit
    const habitStreaks = habits.map((habit) => {
      const completedDates = new Set(
        habit.logs
          .filter((l) => l.completed)
          .map((l) => new Date(l.date).toDateString())
      );

      let streak = 0;
      const checkDate = new Date(today);
      
      for (let i = 0; i < 365; i++) {
        if (completedDates.has(checkDate.toDateString())) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (i > 0) {
          break;
        } else {
          checkDate.setDate(checkDate.getDate() - 1);
        }
      }

      return {
        id: habit.id,
        name: habit.name,
        icon: habit.icon,
        color: habit.color,
        streak,
        completedToday: completedDates.has(todayStr),
      };
    });

    // Calculate weekly completion rate
    const weekDays = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      
      const completed = habits.filter((h) =>
        h.logs.some((log) => log.completed && new Date(log.date).toDateString() === dateStr)
      ).length;

      weekDays.push({
        date: date.toISOString(),
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        completed,
        total: habits.length,
        percentage: habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0,
      });
    }

    // Best streak
    const bestStreak = Math.max(...habitStreaks.map((h) => h.streak), 0);
    const bestStreakHabit = habitStreaks.find((h) => h.streak === bestStreak);

    // Total completions this week
    const totalCompletionsThisWeek = habits.reduce((sum, habit) => {
      return sum + habit.logs.filter((l) => l.completed).length;
    }, 0);

    return NextResponse.json({
      // Overview stats
      overview: {
        totalPages: pages,
        totalDatabases: databases,
        totalFolders: folders,
        totalHabits: habits.length,
      },
      // Today's progress
      today: {
        habitsCompleted: habitsCompletedToday,
        habitsTotal: habits.length,
        percentage: habits.length > 0 
          ? Math.round((habitsCompletedToday / habits.length) * 100) 
          : 0,
      },
      // Habit streaks
      streaks: {
        habits: habitStreaks.sort((a, b) => b.streak - a.streak),
        best: bestStreakHabit,
        totalCompletionsThisWeek,
      },
      // Weekly chart data
      weeklyProgress: weekDays,
      // Recent activity
      recentPages: recentPages.map((p) => ({
        id: p.id,
        title: p.title,
        icon: p.icon,
        updatedAt: p.updatedAt,
        folderName: p.folder?.name,
        folderIcon: p.folder?.icon,
      })),
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}

