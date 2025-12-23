"use client";

/**
 * Database View Page
 * 
 * View and edit a single database with its table.
 */

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DatabaseTable, Column, Row } from "@/components/database/DatabaseTable";
import { ColorPicker, COLOR_NAMES } from "@/components/ui/ColorPicker";
import {
  ArrowLeft,
  Loader2,
  MoreHorizontal,
  Trash2,
  Palette,
} from "lucide-react";

interface DatabaseData {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  description: string | null;
  columns: string;
  rows: { id: string; data: string; createdAt: string }[];
}

const EMOJI_OPTIONS = ["📊", "📋", "✅", "🛒", "📅", "💰", "📚", "🎯", "💪", "🌟", "📝", "🔥"];

export default function DatabaseViewPage({ params }: { params: Promise<{ databaseId: string }> }) {
  const { databaseId } = use(params);
  const router = useRouter();
  
  const [database, setDatabase] = useState<DatabaseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Parse columns and rows
  const columns: Column[] = database ? JSON.parse(database.columns) : [];
  const rows: Row[] = database
    ? database.rows.map((r) => ({ id: r.id, data: JSON.parse(r.data) }))
    : [];

  // Fetch database
  useEffect(() => {
    fetchDatabase();
  }, [databaseId]);

  const fetchDatabase = async () => {
    try {
      const res = await fetch(`/api/databases/${databaseId}`);
      if (res.ok) {
        const data = await res.json();
        setDatabase(data);
      } else if (res.status === 404) {
        router.push("/databases");
      }
    } catch (error) {
      console.error("Failed to fetch database:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update database
  const updateDatabase = useCallback(
    async (updates: Partial<DatabaseData>) => {
      if (!database) return;
      
      try {
        const res = await fetch(`/api/databases/${databaseId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        
        if (res.ok) {
          const updated = await res.json();
          setDatabase((prev) => prev ? { ...prev, ...updated } : prev);
        }
      } catch (error) {
        console.error("Failed to update database:", error);
      }
    },
    [database, databaseId]
  );

  // Add row
  const addRow = useCallback(async () => {
    try {
      const res = await fetch(`/api/databases/${databaseId}/rows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: {} }),
      });
      
      if (res.ok) {
        fetchDatabase();
      }
    } catch (error) {
      console.error("Failed to add row:", error);
    }
  }, [databaseId]);

  // Update row
  const updateRow = useCallback(
    async (rowId: string, data: Record<string, unknown>) => {
      try {
        await fetch(`/api/databases/${databaseId}/rows/${rowId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data }),
        });
        
        // Update locally for instant feedback
        setDatabase((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            rows: prev.rows.map((r) =>
              r.id === rowId ? { ...r, data: JSON.stringify(data) } : r
            ),
          };
        });
      } catch (error) {
        console.error("Failed to update row:", error);
      }
    },
    [databaseId]
  );

  // Delete row
  const deleteRow = useCallback(
    async (rowId: string) => {
      try {
        await fetch(`/api/databases/${databaseId}/rows/${rowId}`, {
          method: "DELETE",
        });
        
        setDatabase((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            rows: prev.rows.filter((r) => r.id !== rowId),
          };
        });
      } catch (error) {
        console.error("Failed to delete row:", error);
      }
    },
    [databaseId]
  );

  // Add column
  const addColumn = useCallback(
    async (column: Column) => {
      const newColumns = [...columns, column];
      await updateDatabase({ columns: newColumns as unknown as string });
      setDatabase((prev) => prev ? { ...prev, columns: JSON.stringify(newColumns) } : prev);
    },
    [columns, updateDatabase]
  );

  // Delete column
  const deleteColumn = useCallback(
    async (columnId: string) => {
      const newColumns = columns.filter((c) => c.id !== columnId);
      await updateDatabase({ columns: newColumns as unknown as string });
      setDatabase((prev) => prev ? { ...prev, columns: JSON.stringify(newColumns) } : prev);
    },
    [columns, updateDatabase]
  );

  // Delete database
  const deleteDatabase = async () => {
    if (!confirm("Are you sure you want to delete this database? This cannot be undone.")) return;
    
    try {
      const res = await fetch(`/api/databases/${databaseId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/databases");
      }
    } catch (error) {
      console.error("Failed to delete database:", error);
    }
  };

  // Close menus
  useEffect(() => {
    const handleClick = () => {
      setShowMenu(false);
      setShowColorPicker(false);
      setShowEmojiPicker(false);
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-garden-500 animate-spin" />
      </div>
    );
  }

  if (!database) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-[var(--muted)] mb-4">Database not found</p>
        <Link href="/databases" className="text-garden-600 hover:text-garden-700">
          Go back to databases
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Color accent bar */}
      {database.color && (
        <div 
          className="h-1 -mx-8 -mt-8 mb-8"
          style={{ backgroundColor: database.color }}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/databases"
          className="p-2 rounded-lg hover:bg-[var(--card-hover)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="flex-1" />

        {/* Color button */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowColorPicker(!showColorPicker);
            }}
            className={`p-2 rounded-lg transition-colors ${
              database.color ? "ring-2 ring-offset-2 ring-current" : "hover:bg-[var(--card-hover)]"
            }`}
            style={database.color ? { backgroundColor: database.color, color: "white" } : undefined}
            title={database.color ? COLOR_NAMES[database.color] || "Custom" : "Add color"}
          >
            <Palette className="w-5 h-5" />
          </button>

          {showColorPicker && (
            <div
              className="absolute right-0 top-full mt-2 p-3 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <ColorPicker
                selectedColor={database.color}
                onColorSelect={(color) => {
                  updateDatabase({ color });
                  setShowColorPicker(false);
                }}
              />
            </div>
          )}
        </div>

        {/* More menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 rounded-lg hover:bg-[var(--card-hover)] transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 top-full mt-1 w-48 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xl py-1 z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={deleteDatabase}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
                Delete database
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Title section */}
      <div className="flex items-start gap-4 mb-8">
        {/* Icon picker */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowEmojiPicker(!showEmojiPicker);
            }}
            className="text-5xl hover:bg-[var(--card-hover)] rounded-xl p-2 transition-colors"
          >
            {database.icon || "📊"}
          </button>

          {showEmojiPicker && (
            <div
              className="absolute left-0 top-full mt-2 p-3 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid grid-cols-6 gap-1">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      updateDatabase({ icon: emoji });
                      setShowEmojiPicker(false);
                    }}
                    className="p-2 text-xl hover:bg-[var(--card-hover)] rounded-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="flex-1">
          <input
            type="text"
            value={database.name}
            onChange={(e) => setDatabase((prev) => prev ? { ...prev, name: e.target.value } : prev)}
            onBlur={() => updateDatabase({ name: database.name })}
            className="w-full text-4xl font-display font-bold bg-transparent border-none focus:outline-none"
            style={database.color ? { color: database.color } : undefined}
          />
          <p className="text-sm text-[var(--muted)] mt-1">
            {rows.length} {rows.length === 1 ? "row" : "rows"} · {columns.length} {columns.length === 1 ? "column" : "columns"}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <DatabaseTable
          columns={columns}
          rows={rows}
          onAddRow={addRow}
          onUpdateRow={updateRow}
          onDeleteRow={deleteRow}
          onAddColumn={addColumn}
          onUpdateColumn={() => {}}
          onDeleteColumn={deleteColumn}
          color={database.color}
        />
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--muted)]">
        💡 <strong>Tip:</strong> Click any cell to edit. Use the + buttons to add rows and columns.
      </div>
    </div>
  );
}

