/**
 * Folders API
 * 
 * GET /api/folders - Get all folders for the logged-in user
 * POST /api/folders - Create a new folder
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET - Fetch all folders
export async function GET() {
  try {
    // Get the current user
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Fetch all folders for this user
    const folders = await db.folder.findMany({
      where: { userId: session.user.id },
      include: {
        pages: {
          select: { id: true, title: true, icon: true },
          orderBy: { updatedAt: "desc" },
        },
        children: {
          include: {
            pages: {
              select: { id: true, title: true, icon: true },
              orderBy: { updatedAt: "desc" },
            },
          },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(folders);
  } catch (error) {
    console.error("Error fetching folders:", error);
    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 }
    );
  }
}

// POST - Create a new folder
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { name, icon, color, parentId, folderType } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Folder name is required" },
        { status: 400 }
      );
    }

    // Get the next order number
    const lastFolder = await db.folder.findFirst({
      where: { userId: session.user.id, parentId: parentId || null },
      orderBy: { order: "desc" },
    });

    const folder = await db.folder.create({
      data: {
        name,
        icon,
        color,
        parentId,
        folderType,
        order: (lastFolder?.order ?? -1) + 1,
        userId: session.user.id,
      },
    });

    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 }
    );
  }
}

