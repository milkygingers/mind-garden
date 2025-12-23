/**
 * Pages API
 * 
 * GET /api/pages - Get all pages for the logged-in user
 * POST /api/pages - Create a new page
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET - Fetch all pages
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get query params for filtering
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId");
    const favorites = searchParams.get("favorites");

    // Build the where clause
    const where: Record<string, unknown> = { userId: session.user.id };
    if (folderId) where.folderId = folderId;
    if (favorites === "true") where.isFavorite = true;

    const pages = await db.page.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        folder: { select: { id: true, name: true, icon: true } },
      },
    });

    return NextResponse.json(pages);
  } catch (error) {
    console.error("Error fetching pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch pages" },
      { status: 500 }
    );
  }
}

// POST - Create a new page
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { title, folderId, icon, color } = await request.json();

    // If folderId provided, verify it belongs to user
    if (folderId) {
      const folder = await db.folder.findFirst({
        where: { id: folderId, userId: session.user.id },
      });
      if (!folder) {
        return NextResponse.json(
          { error: "Folder not found" },
          { status: 404 }
        );
      }
    }

    const page = await db.page.create({
      data: {
        title: title || "Untitled",
        icon,
        color,
        folderId,
        userId: session.user.id,
        content: JSON.stringify({
          type: "doc",
          content: [{ type: "paragraph" }],
        }),
      },
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error("Error creating page:", error);
    return NextResponse.json(
      { error: "Failed to create page" },
      { status: 500 }
    );
  }
}

