/**
 * Backlinks API Route
 * 
 * GET /api/pages/[pageId]/backlinks - Get pages that link to this page
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

interface RouteParams {
  params: Promise<{ pageId: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { pageId } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the target page exists and belongs to user
    const targetPage = await db.page.findFirst({
      where: {
        id: pageId,
        userId: session.user.id,
      },
    });

    if (!targetPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Find all pages that contain a link to this page
    // Links are stored as /page/[pageId] in the content
    const linkPattern = `/page/${pageId}`;

    const backlinks = await db.page.findMany({
      where: {
        userId: session.user.id,
        id: { not: pageId }, // Exclude self
        content: {
          contains: linkPattern,
        },
      },
      select: {
        id: true,
        title: true,
        icon: true,
        color: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(backlinks);
  } catch (error) {
    console.error("Error fetching backlinks:", error);
    return NextResponse.json(
      { error: "Failed to fetch backlinks" },
      { status: 500 }
    );
  }
}

