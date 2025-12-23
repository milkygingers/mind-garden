/**
 * Habit Log API Routes
 * 
 * POST /api/habits/[habitId]/log - Toggle habit completion for a date
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

interface RouteParams {
  params: Promise<{ habitId: string }>;
}

// POST toggle habit completion
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { habitId } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const habit = await db.habit.findFirst({
      where: {
        id: habitId,
        userId: session.user.id,
      },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const body = await request.json();
    const { date, completed, note } = body;

    if (!date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }

    // Normalize date to start of day in UTC
    const logDate = new Date(date);
    logDate.setUTCHours(0, 0, 0, 0);

    // Check if log exists for this date
    const existingLog = await db.habitLog.findUnique({
      where: {
        habitId_date: {
          habitId,
          date: logDate,
        },
      },
    });

    let log;

    if (existingLog) {
      // Update existing log
      if (completed === false && !note) {
        // If marking as incomplete and no note, delete the log
        await db.habitLog.delete({
          where: { id: existingLog.id },
        });
        log = null;
      } else {
        // Update the log
        log = await db.habitLog.update({
          where: { id: existingLog.id },
          data: {
            completed: completed ?? !existingLog.completed,
            ...(note !== undefined && { note }),
          },
        });
      }
    } else {
      // Create new log
      log = await db.habitLog.create({
        data: {
          habitId,
          date: logDate,
          completed: completed ?? true,
          note,
        },
      });
    }

    return NextResponse.json(log || { deleted: true });
  } catch (error) {
    console.error("Error logging habit:", error);
    return NextResponse.json(
      { error: "Failed to log habit" },
      { status: 500 }
    );
  }
}

