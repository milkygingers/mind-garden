"use client";

/**
 * New Page Button
 * 
 * A client component for creating new pages in a folder.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";

interface NewPageButtonProps {
  folderId: string;
  variant?: "default" | "primary";
}

export function NewPageButton({ folderId, variant = "default" }: NewPageButtonProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId }),
      });

      if (res.ok) {
        const page = await res.json();
        router.push(`/page/${page.id}`);
      }
    } catch (error) {
      console.error("Failed to create page:", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (variant === "primary") {
    return (
      <button
        onClick={handleCreate}
        disabled={isCreating}
        className="inline-flex items-center gap-2 px-4 py-2 bg-garden-600 hover:bg-garden-700 text-white rounded-lg transition-colors disabled:opacity-50"
      >
        {isCreating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
        New Page
      </button>
    );
  }

  return (
    <button
      onClick={handleCreate}
      disabled={isCreating}
      className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] hover:border-garden-500/50 rounded-lg transition-colors disabled:opacity-50"
    >
      {isCreating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Plus className="w-4 h-4" />
      )}
      New Page
    </button>
  );
}

