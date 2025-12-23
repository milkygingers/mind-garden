/**
 * Single Tag API Routes
 * 
 * PATCH  /api/tags/[tagId] - Update a tag
 * DELETE /api/tags/[tagId] - Delete a tag
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

interface RouteParams {
  params: Promise<{ tagId: string }>;
}

// PATCH update a tag
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { tagId } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const existingTag = await db.tag.findFirst({
      where: {
        id: tagId,
        userId: session.user.id,
      },
    });

    if (!existingTag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, color } = body;

    // Check if new name conflicts with existing tag
    if (name && name.trim() !== existingTag.name) {
      const conflict = await db.tag.findUnique({
        where: {
          userId_name: {
            userId: session.user.id,
            name: name.trim(),
          },
        },
      });

      if (conflict) {
        return NextResponse.json(
          { error: "Tag name already exists" },
          { status: 409 }
        );
      }
    }

    const tag = await db.tag.update({
      where: { id: tagId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(color !== undefined && { color }),
      },
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error("Error updating tag:", error);
    return NextResponse.json(
      { error: "Failed to update tag" },
      { status: 500 }
    );
  }
}

// DELETE a tag
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { tagId } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const existingTag = await db.tag.findFirst({
      where: {
        id: tagId,
        userId: session.user.id,
      },
    });

    if (!existingTag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    await db.tag.delete({
      where: { id: tagId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tag:", error);
    return NextResponse.json(
      { error: "Failed to delete tag" },
      { status: 500 }
    );
  }
}

