"use client";

/**
 * Tag Picker Component
 * 
 * A dropdown to select, create, and manage tags for pages
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Tag, Plus, X, Check } from "lucide-react";

interface TagType {
  id: string;
  name: string;
  color: string;
}

interface TagPickerProps {
  pageId: string;
  selectedTags: TagType[];
  onTagsChange: (tags: TagType[]) => void;
}

const TAG_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#84cc16", // lime
  "#22c55e", // green
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#ec4899", // pink
  "#6b7280", // gray
];

export function TagPicker({ pageId, selectedTags, onTagsChange }: TagPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [allTags, setAllTags] = useState<TagType[]>([]);
  const [search, setSearch] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch all tags
  const fetchTags = useCallback(async () => {
    try {
      const res = await fetch("/api/tags");
      if (res.ok) {
        const data = await res.json();
        setAllTags(data);
      }
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowColorPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Filter tags based on search
  const filteredTags = allTags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(search.toLowerCase()) &&
      !selectedTags.some((st) => st.id === tag.id)
  );

  const canCreateNew = search.trim() && 
    !allTags.some((t) => t.name.toLowerCase() === search.trim().toLowerCase());

  // Add existing tag
  const addTag = async (tag: TagType) => {
    try {
      const res = await fetch(`/api/pages/${pageId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagId: tag.id }),
      });

      if (res.ok) {
        onTagsChange([...selectedTags, tag]);
        setSearch("");
      }
    } catch (error) {
      console.error("Failed to add tag:", error);
    }
  };

  // Create new tag and add to page
  const createAndAddTag = async () => {
    if (!search.trim()) return;

    try {
      const res = await fetch(`/api/pages/${pageId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagName: search.trim(), tagColor: newTagColor }),
      });

      if (res.ok) {
        const newTag = await res.json();
        onTagsChange([...selectedTags, newTag]);
        setAllTags([...allTags, newTag]);
        setSearch("");
        setShowColorPicker(false);
        setNewTagColor(TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)]);
      }
    } catch (error) {
      console.error("Failed to create tag:", error);
    }
  };

  // Remove tag from page
  const removeTag = async (tagId: string) => {
    try {
      const res = await fetch(`/api/pages/${pageId}/tags?tagId=${tagId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        onTagsChange(selectedTags.filter((t) => t.id !== tagId));
      }
    } catch (error) {
      console.error("Failed to remove tag:", error);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Selected tags display */}
      <div className="flex flex-wrap items-center gap-1.5">
        {selectedTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: tag.color }}
          >
            {tag.name}
            <button
              onClick={() => removeTag(tag.id)}
              className="hover:bg-white/20 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        
        {/* Add tag button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-hover)] border border-dashed border-[var(--border)] transition-colors"
        >
          <Tag className="w-3 h-3" />
          Add tag
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
          {/* Search input */}
          <div className="p-2 border-b border-[var(--border)]">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search or create tag..."
              className="w-full px-3 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--garden-500)]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && canCreateNew) {
                  createAndAddTag();
                }
              }}
            />
          </div>

          {/* Tag list */}
          <div className="max-h-48 overflow-y-auto p-1">
            {/* Existing tags */}
            {filteredTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => addTag(tag)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--card-hover)] transition-colors text-left"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="text-sm flex-1">{tag.name}</span>
              </button>
            ))}

            {/* Create new tag option */}
            {canCreateNew && (
              <div className="border-t border-[var(--border)] mt-1 pt-1">
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--card-hover)] transition-colors text-left"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: newTagColor }}
                  />
                  <span className="text-sm flex-1">
                    Create &ldquo;<span className="font-medium">{search}</span>&rdquo;
                  </span>
                  <Plus className="w-4 h-4 text-[var(--muted)]" />
                </button>

                {/* Color picker for new tag */}
                {showColorPicker && (
                  <div className="px-3 py-2 border-t border-[var(--border)]">
                    <p className="text-xs text-[var(--muted)] mb-2">Choose color:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {TAG_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setNewTagColor(color)}
                          className={`w-6 h-6 rounded-full transition-transform ${
                            newTagColor === color ? "scale-125 ring-2 ring-offset-1 ring-[var(--foreground)]" : ""
                          }`}
                          style={{ backgroundColor: color }}
                        >
                          {newTagColor === color && (
                            <Check className="w-3 h-3 text-white mx-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={createAndAddTag}
                      className="w-full mt-3 px-3 py-1.5 bg-[var(--garden-500)] text-white text-sm rounded-lg hover:bg-[var(--garden-600)] transition-colors"
                    >
                      Create Tag
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Empty state */}
            {filteredTags.length === 0 && !canCreateNew && (
              <p className="px-3 py-4 text-sm text-[var(--muted)] text-center">
                {search ? "No matching tags" : "No tags yet"}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Simple tag display (for lists, etc.)
export function TagBadge({ tag }: { tag: TagType }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: tag.color }}
    >
      {tag.name}
    </span>
  );
}

