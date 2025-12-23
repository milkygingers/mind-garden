/**
 * Export API Routes
 * 
 * GET /api/export?type=pages|databases|habits|all&format=csv|markdown|json
 * 
 * Exports user data in various formats
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
    const type = searchParams.get("type") || "all";
    const format = searchParams.get("format") || "json";

    let data: Record<string, unknown> = {};
    let filename = "mind-garden-export";
    let contentType = "application/json";
    let content = "";

    // Fetch requested data
    if (type === "pages" || type === "all") {
      const pages = await db.page.findMany({
        where: { userId: session.user.id },
        include: { folder: { select: { name: true } } },
        orderBy: { updatedAt: "desc" },
      });
      data.pages = pages;
    }

    if (type === "databases" || type === "all") {
      const databases = await db.database.findMany({
        where: { userId: session.user.id },
        include: { rows: true },
        orderBy: { updatedAt: "desc" },
      });
      data.databases = databases;
    }

    if (type === "habits" || type === "all") {
      const habits = await db.habit.findMany({
        where: { userId: session.user.id },
        include: { logs: { orderBy: { date: "desc" } } },
        orderBy: { createdAt: "asc" },
      });
      data.habits = habits;
    }

    if (type === "folders" || type === "all") {
      const folders = await db.folder.findMany({
        where: { userId: session.user.id },
        orderBy: { order: "asc" },
      });
      data.folders = folders;
    }

    // Format the data
    switch (format) {
      case "csv":
        content = convertToCSV(data, type);
        contentType = "text/csv";
        filename = `${filename}-${type}.csv`;
        break;

      case "markdown":
        content = convertToMarkdown(data, type);
        contentType = "text/markdown";
        filename = `${filename}-${type}.md`;
        break;

      case "json":
      default:
        content = JSON.stringify(data, null, 2);
        contentType = "application/json";
        filename = `${filename}-${type}.json`;
        break;
    }

    // Return the file
    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting data:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}

// Convert data to CSV format
function convertToCSV(data: Record<string, unknown>, type: string): string {
  const lines: string[] = [];

  // Pages CSV
  if (type === "pages" && Array.isArray(data.pages)) {
    lines.push("Title,Folder,Content,Created,Updated,Is Favorite");
    for (const page of data.pages as Array<{
      title: string;
      folder?: { name: string } | null;
      content?: string | null;
      createdAt: string;
      updatedAt: string;
      isFavorite: boolean;
    }>) {
      const content = (page.content || "").replace(/"/g, '""').replace(/\n/g, " ");
      lines.push(
        `"${page.title}","${page.folder?.name || "No folder"}","${content}","${page.createdAt}","${page.updatedAt}","${page.isFavorite}"`
      );
    }
  }

  // Databases CSV
  if (type === "databases" && Array.isArray(data.databases)) {
    for (const database of data.databases as Array<{
      name: string;
      columns: string;
      rows: Array<{ data: string; createdAt: string }>;
    }>) {
      lines.push(`\n# ${database.name}`);
      
      const columns = JSON.parse(database.columns || "[]") as Array<{ id: string; name: string }>;
      const headers = columns.map((c) => c.name);
      lines.push(headers.join(","));

      for (const row of database.rows) {
        const rowData = JSON.parse(row.data || "{}");
        const values = columns.map((col) => {
          const val = rowData[col.id];
          if (typeof val === "string") return `"${val.replace(/"/g, '""')}"`;
          return val ?? "";
        });
        lines.push(values.join(","));
      }
    }
  }

  // Habits CSV
  if (type === "habits" && Array.isArray(data.habits)) {
    lines.push("Habit,Icon,Color,Created,Total Completions,Current Streak");
    for (const habit of data.habits as Array<{
      name: string;
      icon: string;
      color: string;
      createdAt: string;
      logs: Array<{ completed: boolean; date: string }>;
    }>) {
      const completions = habit.logs.filter((l) => l.completed).length;
      const streak = calculateStreak(habit.logs);
      lines.push(
        `"${habit.name}","${habit.icon}","${habit.color}","${habit.createdAt}","${completions}","${streak}"`
      );
    }

    // Add detailed habit logs
    lines.push("\n# Habit Completion Log");
    lines.push("Habit,Date,Completed");
    for (const habit of data.habits as Array<{
      name: string;
      logs: Array<{ date: string; completed: boolean }>;
    }>) {
      for (const log of habit.logs) {
        lines.push(`"${habit.name}","${log.date}","${log.completed}"`);
      }
    }
  }

  // All data - create sections
  if (type === "all") {
    if (Array.isArray(data.pages)) {
      lines.push("# PAGES");
      lines.push("Title,Folder,Content Preview,Created,Updated");
      for (const page of data.pages as Array<{
        title: string;
        folder?: { name: string } | null;
        content?: string | null;
        createdAt: string;
        updatedAt: string;
      }>) {
        const preview = (page.content || "").substring(0, 100).replace(/"/g, '""').replace(/\n/g, " ");
        lines.push(
          `"${page.title}","${page.folder?.name || ""}","${preview}...","${page.createdAt}","${page.updatedAt}"`
        );
      }
    }

    if (Array.isArray(data.habits)) {
      lines.push("\n# HABITS");
      lines.push("Name,Completions,Streak");
      for (const habit of data.habits as Array<{
        name: string;
        logs: Array<{ completed: boolean; date: string }>;
      }>) {
        const completions = habit.logs.filter((l) => l.completed).length;
        const streak = calculateStreak(habit.logs);
        lines.push(`"${habit.name}","${completions}","${streak}"`);
      }
    }
  }

  return lines.join("\n");
}

// Convert data to Markdown format
function convertToMarkdown(data: Record<string, unknown>, type: string): string {
  const lines: string[] = [];
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  lines.push("# Mind Garden Export");
  lines.push(`*Exported on ${date}*\n`);
  lines.push("---\n");

  // Pages as Markdown
  if ((type === "pages" || type === "all") && Array.isArray(data.pages)) {
    lines.push("## 📄 Pages\n");
    for (const page of data.pages as Array<{
      title: string;
      icon?: string | null;
      folder?: { name: string } | null;
      content?: string | null;
      createdAt: string;
      isFavorite: boolean;
    }>) {
      lines.push(`### ${page.icon || "📝"} ${page.title}`);
      if (page.folder?.name) {
        lines.push(`*Folder: ${page.folder.name}*`);
      }
      if (page.isFavorite) {
        lines.push("⭐ *Favorite*");
      }
      lines.push("");
      
      // Parse and include content
      if (page.content) {
        try {
          const content = JSON.parse(page.content);
          lines.push(tiptapToMarkdown(content));
        } catch {
          lines.push(page.content);
        }
      } else {
        lines.push("*No content*");
      }
      lines.push("\n---\n");
    }
  }

  // Databases as Markdown tables
  if ((type === "databases" || type === "all") && Array.isArray(data.databases)) {
    lines.push("## 🗃️ Databases\n");
    for (const database of data.databases as Array<{
      name: string;
      icon?: string | null;
      description?: string | null;
      columns: string;
      rows: Array<{ data: string }>;
    }>) {
      lines.push(`### ${database.icon || "📊"} ${database.name}`);
      if (database.description) {
        lines.push(`*${database.description}*\n`);
      }

      const columns = JSON.parse(database.columns || "[]") as Array<{ id: string; name: string; type: string }>;
      
      if (columns.length > 0) {
        // Table header
        lines.push("| " + columns.map((c) => c.name).join(" | ") + " |");
        lines.push("| " + columns.map(() => "---").join(" | ") + " |");

        // Table rows
        for (const row of database.rows) {
          const rowData = JSON.parse(row.data || "{}");
          const values = columns.map((col) => {
            const val = rowData[col.id];
            if (col.type === "checkbox") return val ? "✅" : "⬜";
            if (val === null || val === undefined) return "";
            return String(val);
          });
          lines.push("| " + values.join(" | ") + " |");
        }
      }
      lines.push("\n---\n");
    }
  }

  // Habits as Markdown
  if ((type === "habits" || type === "all") && Array.isArray(data.habits)) {
    lines.push("## 🎯 Habits\n");
    for (const habit of data.habits as Array<{
      name: string;
      icon: string;
      description?: string | null;
      logs: Array<{ completed: boolean; date: string }>;
    }>) {
      const completions = habit.logs.filter((l) => l.completed).length;
      const streak = calculateStreak(habit.logs);

      lines.push(`### ${habit.icon} ${habit.name}`);
      if (habit.description) {
        lines.push(`*${habit.description}*`);
      }
      lines.push(`- 🔥 **Current Streak:** ${streak} days`);
      lines.push(`- ✅ **Total Completions:** ${completions}`);
      lines.push("");
    }
  }

  // Folders
  if ((type === "folders" || type === "all") && Array.isArray(data.folders)) {
    lines.push("## 📁 Folders\n");
    for (const folder of data.folders as Array<{
      name: string;
      icon?: string | null;
      folderType?: string | null;
    }>) {
      lines.push(`- ${folder.icon || "📁"} **${folder.name}** ${folder.folderType ? `(${folder.folderType})` : ""}`);
    }
  }

  return lines.join("\n");
}

// Convert TipTap JSON to Markdown
function tiptapToMarkdown(doc: { type: string; content?: Array<{ type: string; content?: Array<{ text?: string; marks?: Array<{ type: string }> }>; attrs?: { level?: number } }> }): string {
  if (!doc.content) return "";

  const lines: string[] = [];

  for (const node of doc.content) {
    switch (node.type) {
      case "paragraph":
        lines.push(inlineToMarkdown(node.content || []));
        lines.push("");
        break;
      case "heading":
        const level = node.attrs?.level || 1;
        lines.push("#".repeat(level) + " " + inlineToMarkdown(node.content || []));
        lines.push("");
        break;
      case "bulletList":
        // Simplified - just add text content
        lines.push(inlineToMarkdown(node.content || []));
        break;
      default:
        if (node.content) {
          lines.push(inlineToMarkdown(node.content));
        }
    }
  }

  return lines.join("\n");
}

function inlineToMarkdown(content: Array<{ text?: string; marks?: Array<{ type: string }> }>): string {
  return content
    .map((node) => {
      let text = node.text || "";
      if (node.marks) {
        for (const mark of node.marks) {
          switch (mark.type) {
            case "bold":
              text = `**${text}**`;
              break;
            case "italic":
              text = `*${text}*`;
              break;
            case "code":
              text = `\`${text}\``;
              break;
          }
        }
      }
      return text;
    })
    .join("");
}

// Calculate current streak
function calculateStreak(logs: Array<{ completed: boolean; date: string }>): number {
  const completedDates = new Set(
    logs
      .filter((l) => l.completed)
      .map((l) => new Date(l.date).toDateString())
  );

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);

    if (completedDates.has(checkDate.toDateString())) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  return streak;
}

