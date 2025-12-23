/**
 * Page Search API Route
 * 
 * GET /api/pages/search?q=query - Search pages for linking
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase().trim();
    const excludeId = searchParams.get("exclude"); // Exclude current page

    const pages = await db.page.findMany({
      where: {
        userId: session.user.id,
        ...(excludeId && { id: { not: excludeId } }),
        ...(query && {
          title: { contains: query, mode: "insensitive" },
        }),
      },
      select: {
        id: true,
        title: true,
        icon: true,
        color: true,
        folder: { select: { name: true, icon: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    });

    return NextResponse.json(pages);
  } catch (error) {
    console.error("Error searching pages:", error);
    return NextResponse.json(
      { error: "Failed to search pages" },
      { status: 500 }
    );
  }
}

