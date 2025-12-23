"use client";

/**
 * Tags Management Page
 * 
 * View, create, edit, and delete tags
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Tag,
  Plus,
  Trash2,
  Edit3,
  X,
  Check,
  FileText,
  Sparkles,
} from "lucide-react";

interface TagType {
  id: string;
  name: string;
  color: string;
  _count?: { pages: number };
}

const TAG_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e",
  "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6",
  "#a855f7", "#ec4899", "#6b7280",
];

export default function TagsPage() {
  const [tags, setTags] = useState<TagType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTag, setShowNewTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  // Fetch tags
  const fetchTags = useCallback(async () => {
    try {
      const res = await fetch("/api/tags");
      if (res.ok) {
        const data = await res.json();
        setTags(data);
      }
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // Create new tag
  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName, color: newTagColor }),
      });

      if (res.ok) {
        const tag = await res.json();
        setTags([...tags, { ...tag, _count: { pages: 0 } }]);
        setNewTagName("");
        setNewTagColor(TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)]);
        setShowNewTag(false);
      } else if (res.status === 409) {
        alert("A tag with that name already exists");
      }
    } catch (error) {
      console.error("Failed to create tag:", error);
    }
  };

  // Start editing a tag
  const startEditing = (tag: TagType) => {
    setEditingTag(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  // Save tag edits
  const saveTagEdit = async (tagId: string) => {
    if (!editName.trim()) return;

    try {
      const res = await fetch(`/api/tags/${tagId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, color: editColor }),
      });

      if (res.ok) {
        setTags(tags.map((t) =>
          t.id === tagId ? { ...t, name: editName, color: editColor } : t
        ));
        setEditingTag(null);
      } else if (res.status === 409) {
        alert("A tag with that name already exists");
      }
    } catch (error) {
      console.error("Failed to update tag:", error);
    }
  };

  // Delete tag
  const deleteTag = async (tagId: string) => {
    if (!confirm("Delete this tag? It will be removed from all pages.")) return;

    try {
      const res = await fetch(`/api/tags/${tagId}`, { method: "DELETE" });
      if (res.ok) {
        setTags(tags.filter((t) => t.id !== tagId));
      }
    } catch (error) {
      console.error("Failed to delete tag:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--garden-500)]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl text-white">
            <Tag className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold">Tags</h1>
        </div>
        <p className="text-[var(--muted)]">
          Organize your pages with custom tags
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 bg-[var(--card)] rounded-xl border border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
              <Tag className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tags.length}</p>
              <p className="text-sm text-[var(--muted)]">Total Tags</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-[var(--card)] rounded-xl border border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {tags.reduce((sum, t) => sum + (t._count?.pages || 0), 0)}
              </p>
              <p className="text-sm text-[var(--muted)]">Tagged Pages</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add tag button */}
      <div className="mb-6">
        <button
          onClick={() => setShowNewTag(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--garden-500)] hover:bg-[var(--garden-600)] text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Tag
        </button>
      </div>

      {/* New tag form */}
      {showNewTag && (
        <div className="mb-6 p-4 bg-[var(--card)] rounded-xl border border-[var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Create New Tag</h3>
            <button
              onClick={() => setShowNewTag(false)}
              className="p-1 hover:bg-[var(--card-hover)] rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleCreateTag} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tag Name</label>
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="e.g., Important, Work, Personal"
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--garden-500)]"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <div className="flex flex-wrap gap-2">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewTagColor(color)}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      newTagColor === color ? "scale-125 ring-2 ring-offset-2 ring-[var(--foreground)]" : ""
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {newTagColor === color && (
                      <Check className="w-4 h-4 text-white mx-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!newTagName.trim()}
                className="px-4 py-2 bg-[var(--garden-500)] hover:bg-[var(--garden-600)] text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Create Tag
              </button>
              <button
                type="button"
                onClick={() => setShowNewTag(false)}
                className="px-4 py-2 bg-[var(--background)] hover:bg-[var(--card-hover)] border border-[var(--border)] rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tags list */}
      {tags.length === 0 ? (
        <div className="text-center py-16 bg-[var(--card)] rounded-xl border border-[var(--border)]">
          <Tag className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No tags yet</h3>
          <p className="text-[var(--muted)] mb-4">
            Create tags to organize your pages
          </p>
          <button
            onClick={() => setShowNewTag(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--garden-500)] hover:bg-[var(--garden-600)] text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Your First Tag
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="p-4 bg-[var(--card)] rounded-xl border border-[var(--border)] hover:shadow-md transition-all group"
            >
              {editingTag === tag.id ? (
                // Edit mode
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-2 py-1 bg-[var(--background)] border border-[var(--border)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--garden-500)]"
                    autoFocus
                  />
                  <div className="flex flex-wrap gap-1">
                    {TAG_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setEditColor(color)}
                        className={`w-5 h-5 rounded-full ${
                          editColor === color ? "ring-2 ring-offset-1 ring-[var(--foreground)]" : ""
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveTagEdit(tag.id)}
                      className="px-2 py-1 bg-[var(--garden-500)] text-white text-sm rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingTag(null)}
                      className="px-2 py-1 text-sm text-[var(--muted)]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // Display mode
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="font-medium flex-1">{tag.name}</span>
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <button
                        onClick={() => startEditing(tag)}
                        className="p-1 hover:bg-[var(--card-hover)] rounded"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4 text-[var(--muted)]" />
                      </button>
                      <button
                        onClick={() => deleteTag(tag.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-[var(--muted)]">
                    {tag._count?.pages || 0} {(tag._count?.pages || 0) === 1 ? "page" : "pages"}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      {tags.length > 0 && (
        <div className="mt-8 p-4 bg-[var(--card)] rounded-xl border border-[var(--border)]">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--garden-500)]" />
            Tips for Using Tags
          </h3>
          <ul className="text-sm text-[var(--muted)] space-y-1">
            <li>• Add tags to pages from the page editor</li>
            <li>• Use tags like &ldquo;Important&rdquo;, &ldquo;In Progress&rdquo;, or &ldquo;Review&rdquo;</li>
            <li>• Color-code by category: work, personal, ideas</li>
            <li>• Search for tags using the search feature (⌘K)</li>
          </ul>
        </div>
      )}
    </div>
  );
}

