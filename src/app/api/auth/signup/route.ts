/**
 * Signup API Route
 * 
 * POST /api/auth/signup
 * Creates a new user account with email and password.
 */

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    // Get the data from the request
    const { name, email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validate email format (simple check)
    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Hash the password (never store plain text passwords!)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the user
    const user = await db.user.create({
      data: {
        name,
        email,
        hashedPassword,
      },
    });

    // Create default PARA folders for the new user
    const paraFolders = [
      { name: "Projects", icon: "🎯", folderType: "project", order: 0 },
      { name: "Areas", icon: "🌱", folderType: "area", order: 1 },
      { name: "Resources", icon: "📚", folderType: "resource", order: 2 },
      { name: "Archive", icon: "📦", folderType: "archive", order: 3 },
    ];

    for (const folder of paraFolders) {
      await db.folder.create({
        data: {
          ...folder,
          isDefault: true,
          userId: user.id,
        },
      });
    }

    // Return success (don't include password in response!)
    return NextResponse.json(
      {
        message: "Account created successfully!",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

