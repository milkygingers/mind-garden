/**
 * Single Database API
 * 
 * GET /api/databases/[databaseId] - Get a specific database with rows
 * PATCH /api/databases/[databaseId] - Update database (name, columns, etc)
 * DELETE /api/databases/[databaseId] - Delete a database
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

interface RouteParams {
  params: Promise<{ databaseId: string }>;
}

// GET - Fetch database with all rows
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { databaseId } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const database = await db.database.findFirst({
      where: { id: databaseId, userId: session.user.id },
      include: {
        rows: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!database) {
      return NextResponse.json({ error: "Database not found" }, { status: 404 });
    }

    return NextResponse.json(database);
  } catch (error) {
    console.error("Error fetching database:", error);
    return NextResponse.json({ error: "Failed to fetch database" }, { status: 500 });
  }
}

// PATCH - Update database
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { databaseId } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const updates = await request.json();

    // Verify ownership
    const existing = await db.database.findFirst({
      where: { id: databaseId, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Database not found" }, { status: 404 });
    }

    const database = await db.database.update({
      where: { id: databaseId },
      data: {
        name: updates.name,
        icon: updates.icon,
        color: updates.color,
        description: updates.description,
        columns: updates.columns ? JSON.stringify(updates.columns) : undefined,
      },
    });

    return NextResponse.json(database);
  } catch (error) {
    console.error("Error updating database:", error);
    return NextResponse.json({ error: "Failed to update database" }, { status: 500 });
  }
}

// DELETE - Delete database
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { databaseId } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify ownership
    const existing = await db.database.findFirst({
      where: { id: databaseId, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Database not found" }, { status: 404 });
    }

    await db.database.delete({ where: { id: databaseId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting database:", error);
    return NextResponse.json({ error: "Failed to delete database" }, { status: 500 });
  }
}

