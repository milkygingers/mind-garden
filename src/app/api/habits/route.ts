/**
 * Habits API Routes
 * 
 * GET  /api/habits - Get all habits for the current user
 * POST /api/habits - Create a new habit
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET all habits
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const habits = await db.habit.findMany({
      where: {
        userId: session.user.id,
        isArchived: false,
      },
      include: {
        logs: {
          where: {
            date: {
              gte: new Date(new Date().setDate(new Date().getDate() - 60)), // Last 60 days
            },
          },
          orderBy: { date: "desc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(habits);
  } catch (error) {
    console.error("Error fetching habits:", error);
    return NextResponse.json(
      { error: "Failed to fetch habits" },
      { status: 500 }
    );
  }
}

// POST create a new habit
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, icon, color, description, frequency, targetDays, reminderEnabled, reminderTime } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Habit name is required" },
        { status: 400 }
      );
    }

    const habit = await db.habit.create({
      data: {
        name,
        icon: icon || "✨",
        color: color || "#10b981",
        description,
        frequency: frequency || "daily",
        targetDays: targetDays ? JSON.stringify(targetDays) : null,
        reminderEnabled: reminderEnabled || false,
        reminderTime: reminderTime || null,
        userId: session.user.id,
      },
    });

    return NextResponse.json(habit, { status: 201 });
  } catch (error) {
    console.error("Error creating habit:", error);
    return NextResponse.json(
      { error: "Failed to create habit" },
      { status: 500 }
    );
  }
}

