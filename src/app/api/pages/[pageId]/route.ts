/**
 * Single Page API
 * 
 * GET /api/pages/[pageId] - Get a specific page
 * PATCH /api/pages/[pageId] - Update a page
 * DELETE /api/pages/[pageId] - Delete a page
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

interface RouteParams {
  params: Promise<{ pageId: string }>;
}

// GET - Fetch a single page
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { pageId } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const page = await db.page.findFirst({
      where: { id: pageId, userId: session.user.id },
      include: {
        folder: { select: { id: true, name: true, icon: true } },
        tags: { select: { id: true, name: true, color: true } },
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error fetching page:", error);
    return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 });
  }
}

// PATCH - Update a page
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { pageId } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const updates = await request.json();

    // Make sure page belongs to user
    const existing = await db.page.findFirst({
      where: { id: pageId, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // If moving to a new folder, verify it belongs to user
    if (updates.folderId && updates.folderId !== existing.folderId) {
      const folder = await db.folder.findFirst({
        where: { id: updates.folderId, userId: session.user.id },
      });
      if (!folder) {
        return NextResponse.json({ error: "Folder not found" }, { status: 404 });
      }
    }

    const page = await db.page.update({
      where: { id: pageId },
      data: {
        title: updates.title,
        content: updates.content,
        icon: updates.icon,
        color: updates.color,
        folderId: updates.folderId,
        isFavorite: updates.isFavorite,
      },
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error updating page:", error);
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
  }
}

// DELETE - Delete a page
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { pageId } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Make sure page belongs to user
    const existing = await db.page.findFirst({
      where: { id: pageId, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    await db.page.delete({ where: { id: pageId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting page:", error);
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
  }
}

