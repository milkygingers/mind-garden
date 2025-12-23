/**
 * Search API Route
 * 
 * GET /api/search?q=query - Search across pages, databases, habits, and folders
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

    if (!query || query.length < 1) {
      return NextResponse.json({ results: [] });
    }

    const userId = session.user.id;

    // Search all content types in parallel
    const [pages, databases, habits, folders] = await Promise.all([
      // Search pages
      db.page.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          icon: true,
          color: true,
          updatedAt: true,
          folder: { select: { name: true, icon: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
      }),

      // Search databases
      db.database.findMany({
        where: {
          userId,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
          description: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),

      // Search habits
      db.habit.findMany({
        where: {
          userId,
          isArchived: false,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),

      // Search folders
      db.folder.findMany({
        where: {
          userId,
          name: { contains: query, mode: "insensitive" },
        },
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
          _count: { select: { pages: true } },
        },
        orderBy: { order: "asc" },
        take: 5,
      }),
    ]);

    // Format results
    const results = [
      ...pages.map((page) => ({
        id: page.id,
        type: "page" as const,
        title: page.title,
        subtitle: page.folder ? `${page.folder.icon} ${page.folder.name}` : "No folder",
        icon: page.icon || "📄",
        color: page.color,
        href: `/page/${page.id}`,
        updatedAt: page.updatedAt,
      })),
      ...databases.map((db) => ({
        id: db.id,
        type: "database" as const,
        title: db.name,
        subtitle: db.description || "Database",
        icon: db.icon || "🗃️",
        color: db.color,
        href: `/databases/${db.id}`,
        updatedAt: db.updatedAt,
      })),
      ...habits.map((habit) => ({
        id: habit.id,
        type: "habit" as const,
        title: habit.name,
        subtitle: "Habit",
        icon: habit.icon || "🎯",
        color: habit.color,
        href: "/habits",
      })),
      ...folders.map((folder) => ({
        id: folder.id,
        type: "folder" as const,
        title: folder.name,
        subtitle: `${folder._count.pages} pages`,
        icon: folder.icon || "📁",
        color: folder.color,
        href: `/folder/${folder.id}`,
      })),
    ];

    // Sort by relevance (exact matches first, then by update time)
    results.sort((a, b) => {
      const aExact = a.title.toLowerCase() === query;
      const bExact = b.title.toLowerCase() === query;
      if (aExact && !bExact) return -1;
      if (bExact && !aExact) return 1;
      
      const aStarts = a.title.toLowerCase().startsWith(query);
      const bStarts = b.title.toLowerCase().startsWith(query);
      if (aStarts && !bStarts) return -1;
      if (bStarts && !aStarts) return 1;
      
      return 0;
    });

    return NextResponse.json({
      query,
      results,
      counts: {
        pages: pages.length,
        databases: databases.length,
        habits: habits.length,
        folders: folders.length,
        total: results.length,
      },
    });
  } catch (error) {
    console.error("Error searching:", error);
    return NextResponse.json(
      { error: "Failed to search" },
      { status: 500 }
    );
  }
}

