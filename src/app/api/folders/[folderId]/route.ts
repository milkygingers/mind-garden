/**
 * Single Folder API
 * 
 * GET /api/folders/[folderId] - Get a specific folder
 * PATCH /api/folders/[folderId] - Update a folder
 * DELETE /api/folders/[folderId] - Delete a folder
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

interface RouteParams {
  params: Promise<{ folderId: string }>;
}

// GET - Fetch a single folder
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { folderId } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const folder = await db.folder.findFirst({
      where: { id: folderId, userId: session.user.id },
      include: {
        pages: { orderBy: { updatedAt: "desc" } },
        children: { orderBy: { order: "asc" } },
      },
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    return NextResponse.json(folder);
  } catch (error) {
    console.error("Error fetching folder:", error);
    return NextResponse.json({ error: "Failed to fetch folder" }, { status: 500 });
  }
}

// PATCH - Update a folder
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { folderId } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const updates = await request.json();

    // Make sure folder belongs to user
    const existing = await db.folder.findFirst({
      where: { id: folderId, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const folder = await db.folder.update({
      where: { id: folderId },
      data: {
        name: updates.name,
        icon: updates.icon,
        color: updates.color,
        parentId: updates.parentId,
      },
    });

    return NextResponse.json(folder);
  } catch (error) {
    console.error("Error updating folder:", error);
    return NextResponse.json({ error: "Failed to update folder" }, { status: 500 });
  }
}

// DELETE - Delete a folder
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { folderId } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Make sure folder belongs to user
    const existing = await db.folder.findFirst({
      where: { id: folderId, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // Don't allow deleting default PARA folders
    if (existing.isDefault) {
      return NextResponse.json(
        { error: "Cannot delete default folders" },
        { status: 400 }
      );
    }

    await db.folder.delete({ where: { id: folderId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting folder:", error);
    return NextResponse.json({ error: "Failed to delete folder" }, { status: 500 });
  }
}

