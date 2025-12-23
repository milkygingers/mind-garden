/**
 * Single Row API
 * 
 * PATCH /api/databases/[databaseId]/rows/[rowId] - Update a row
 * DELETE /api/databases/[databaseId]/rows/[rowId] - Delete a row
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

interface RouteParams {
  params: Promise<{ databaseId: string; rowId: string }>;
}

// PATCH - Update row data
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { databaseId, rowId } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify database ownership
    const database = await db.database.findFirst({
      where: { id: databaseId, userId: session.user.id },
    });

    if (!database) {
      return NextResponse.json({ error: "Database not found" }, { status: 404 });
    }

    const { data } = await request.json();

    const row = await db.databaseRow.update({
      where: { id: rowId },
      data: {
        data: JSON.stringify(data),
      },
    });

    return NextResponse.json(row);
  } catch (error) {
    console.error("Error updating row:", error);
    return NextResponse.json({ error: "Failed to update row" }, { status: 500 });
  }
}

// DELETE - Delete a row
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { databaseId, rowId } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify database ownership
    const database = await db.database.findFirst({
      where: { id: databaseId, userId: session.user.id },
    });

    if (!database) {
      return NextResponse.json({ error: "Database not found" }, { status: 404 });
    }

    await db.databaseRow.delete({ where: { id: rowId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting row:", error);
    return NextResponse.json({ error: "Failed to delete row" }, { status: 500 });
  }
}

