/**
 * Page Tags API Routes
 * 
 * GET   /api/pages/[pageId]/tags - Get tags for a page
 * POST  /api/pages/[pageId]/tags - Add tag to page
 * DELETE /api/pages/[pageId]/tags - Remove tag from page
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

interface RouteParams {
  params: Promise<{ pageId: string }>;
}

// GET tags for a page
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { pageId } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const page = await db.page.findFirst({
      where: {
        id: pageId,
        userId: session.user.id,
      },
      include: {
        tags: true,
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json(page.tags);
  } catch (error) {
    console.error("Error fetching page tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch page tags" },
      { status: 500 }
    );
  }
}

// POST add tag to page
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { pageId } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tagId, tagName, tagColor } = body;

    // Verify page ownership
    const page = await db.page.findFirst({
      where: {
        id: pageId,
        userId: session.user.id,
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    let tag;

    if (tagId) {
      // Use existing tag
      tag = await db.tag.findFirst({
        where: {
          id: tagId,
          userId: session.user.id,
        },
      });

      if (!tag) {
        return NextResponse.json({ error: "Tag not found" }, { status: 404 });
      }
    } else if (tagName) {
      // Create new tag or find existing
      tag = await db.tag.upsert({
        where: {
          userId_name: {
            userId: session.user.id,
            name: tagName.trim(),
          },
        },
        update: {},
        create: {
          name: tagName.trim(),
          color: tagColor || "#6b7280",
          userId: session.user.id,
        },
      });
    } else {
      return NextResponse.json(
        { error: "Tag ID or name is required" },
        { status: 400 }
      );
    }

    // Connect tag to page
    await db.page.update({
      where: { id: pageId },
      data: {
        tags: {
          connect: { id: tag.id },
        },
      },
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error("Error adding tag to page:", error);
    return NextResponse.json(
      { error: "Failed to add tag to page" },
      { status: 500 }
    );
  }
}

// DELETE remove tag from page
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { pageId } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get("tagId");

    if (!tagId) {
      return NextResponse.json(
        { error: "Tag ID is required" },
        { status: 400 }
      );
    }

    // Verify page ownership
    const page = await db.page.findFirst({
      where: {
        id: pageId,
        userId: session.user.id,
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Disconnect tag from page
    await db.page.update({
      where: { id: pageId },
      data: {
        tags: {
          disconnect: { id: tagId },
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing tag from page:", error);
    return NextResponse.json(
      { error: "Failed to remove tag from page" },
      { status: 500 }
    );
  }
}

