/**
 * Single Habit API Routes
 * 
 * GET    /api/habits/[habitId] - Get a specific habit
 * PATCH  /api/habits/[habitId] - Update a habit
 * DELETE /api/habits/[habitId] - Delete a habit
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

interface RouteParams {
  params: Promise<{ habitId: string }>;
}

// GET a specific habit
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { habitId } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const habit = await db.habit.findFirst({
      where: {
        id: habitId,
        userId: session.user.id,
      },
      include: {
        logs: {
          orderBy: { date: "desc" },
        },
      },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    return NextResponse.json(habit);
  } catch (error) {
    console.error("Error fetching habit:", error);
    return NextResponse.json(
      { error: "Failed to fetch habit" },
      { status: 500 }
    );
  }
}

// PATCH update a habit
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { habitId } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const existingHabit = await db.habit.findFirst({
      where: {
        id: habitId,
        userId: session.user.id,
      },
    });

    if (!existingHabit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, icon, color, description, frequency, targetDays, isArchived, reminderEnabled, reminderTime } = body;

    const habit = await db.habit.update({
      where: { id: habitId },
      data: {
        ...(name !== undefined && { name }),
        ...(icon !== undefined && { icon }),
        ...(color !== undefined && { color }),
        ...(description !== undefined && { description }),
        ...(frequency !== undefined && { frequency }),
        ...(targetDays !== undefined && { targetDays: JSON.stringify(targetDays) }),
        ...(isArchived !== undefined && { isArchived }),
        ...(reminderEnabled !== undefined && { reminderEnabled }),
        ...(reminderTime !== undefined && { reminderTime }),
      },
    });

    return NextResponse.json(habit);
  } catch (error) {
    console.error("Error updating habit:", error);
    return NextResponse.json(
      { error: "Failed to update habit" },
      { status: 500 }
    );
  }
}

// DELETE a habit
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { habitId } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const existingHabit = await db.habit.findFirst({
      where: {
        id: habitId,
        userId: session.user.id,
      },
    });

    if (!existingHabit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    await db.habit.delete({
      where: { id: habitId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting habit:", error);
    return NextResponse.json(
      { error: "Failed to delete habit" },
      { status: 500 }
    );
  }
}

