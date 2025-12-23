/**
 * Database Rows API
 * 
 * POST /api/databases/[databaseId]/rows - Add a new row
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

interface RouteParams {
  params: Promise<{ databaseId: string }>;
}

// POST - Create a new row
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { databaseId } = await params;
    
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

    const row = await db.databaseRow.create({
      data: {
        data: JSON.stringify(data || {}),
        databaseId,
      },
    });

    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    console.error("Error creating row:", error);
    return NextResponse.json({ error: "Failed to create row" }, { status: 500 });
  }
}

