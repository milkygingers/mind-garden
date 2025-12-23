/**
 * Databases API
 * 
 * GET /api/databases - Get all databases for the logged-in user
 * POST /api/databases - Create a new database
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Default columns for new databases
const DEFAULT_COLUMNS = [
  { id: "title", name: "Name", type: "text" },
  { id: "status", name: "Status", type: "select", options: ["To Do", "In Progress", "Done"] },
];

// GET - Fetch all databases
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const databases = await db.database.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { rows: true } },
      },
    });

    return NextResponse.json(databases);
  } catch (error) {
    console.error("Error fetching databases:", error);
    return NextResponse.json({ error: "Failed to fetch databases" }, { status: 500 });
  }
}

// POST - Create a new database
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { name, icon, color, template } = await request.json();

    // Choose columns based on template
    let columns = DEFAULT_COLUMNS;
    if (template === "todo") {
      columns = [
        { id: "task", name: "Task", type: "text" },
        { id: "status", name: "Status", type: "select", options: ["To Do", "In Progress", "Done"] },
        { id: "priority", name: "Priority", type: "select", options: ["Low", "Medium", "High"] },
        { id: "done", name: "Completed", type: "checkbox" },
      ];
    } else if (template === "shopping") {
      columns = [
        { id: "item", name: "Item", type: "text" },
        { id: "price", name: "Price", type: "number" },
        { id: "quantity", name: "Qty", type: "number" },
        { id: "category", name: "Category", type: "select", options: ["Groceries", "Household", "Personal", "Other"] },
        { id: "bought", name: "Bought", type: "checkbox" },
      ];
    } else if (template === "tracker") {
      columns = [
        { id: "date", name: "Date", type: "text" },
        { id: "habit", name: "Habit", type: "text" },
        { id: "completed", name: "Done", type: "checkbox" },
        { id: "notes", name: "Notes", type: "text" },
      ];
    }

    const database = await db.database.create({
      data: {
        name: name || "Untitled Database",
        icon,
        color,
        columns: JSON.stringify(columns),
        userId: session.user.id,
      },
    });

    return NextResponse.json(database, { status: 201 });
  } catch (error) {
    console.error("Error creating database:", error);
    return NextResponse.json({ error: "Failed to create database" }, { status: 500 });
  }
}

