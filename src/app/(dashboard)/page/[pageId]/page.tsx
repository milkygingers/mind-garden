"use client";

/**
 * Page View/Edit
 * 
 * The main page editing experience where users can:
 * - Edit the page title
 * - Add/edit content with the rich text editor
 * - Set page icon and color
 * - Toggle favorite status
 */

import { useEffect, useState, useCallback, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageEditor } from "@/components/editor/PageEditor";
import { ColorPicker, COLOR_NAMES } from "@/components/ui/ColorPicker";
import { TagPicker } from "@/components/tags/TagPicker";
import {
  ArrowLeft,
  Star,
  Trash2,
  MoreHorizontal,
  FolderOpen,
  Clock,
  Loader2,
  Check,
  Palette,
} from "lucide-react";

// Page data type
interface PageData {
  id: string;
  title: string;
  content: string | null;
  icon: string | null;
  color: string | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  folder: {
    id: string;
    name: string;
    icon: string | null;
  } | null;
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

// Common emoji options for quick selection
const EMOJI_OPTIONS = [
  "📄", "📝", "📋", "📌", "💡", "⭐", "🎯", "🚀",
  "💪", "🌱", "🔥", "💎", "🎨", "📚", "✅", "❤️",
];

export default function PageView({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = use(params);
  const router = useRouter();
  
  const [page, setPage] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  // Use refs for timeout to avoid re-render loops
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialContentRef = useRef<string | null>(null);

  // Fetch page data
  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await fetch(`/api/pages/${pageId}`);
        if (res.ok) {
          const data = await res.json();
          setPage(data);
          // Store initial content in ref (won't cause re-renders)
          initialContentRef.current = data.content;
        } else if (res.status === 404) {
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Failed to fetch page:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPage();
  }, [pageId, router]);

  // Save page updates (stable function - no deps that change often)
  const savePage = useCallback(
    async (updates: Partial<PageData>) => {
      if (!page) return;
      
      setSaveStatus("saving");
      try {
        const res = await fetch(`/api/pages/${pageId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        
        if (res.ok) {
          // Only update non-content fields to avoid re-render loop
          const updated = await res.json();
          setPage((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              title: updates.title ?? prev.title,
              icon: updates.icon ?? prev.icon,
              color: updates.color !== undefined ? updates.color : prev.color,
              isFavorite: updates.isFavorite ?? prev.isFavorite,
              updatedAt: updated.updatedAt,
              // Don't update content from response - editor has latest
            };
          });
          setSaveStatus("saved");
          // Reset to idle after showing "saved"
          setTimeout(() => setSaveStatus("idle"), 2000);
        }
      } catch (error) {
        console.error("Failed to save page:", error);
        setSaveStatus("idle");
      }
    },
    [page, pageId]
  );

  // Debounced content save - using ref to avoid dependency issues
  const handleContentUpdate = useCallback(
    (content: string) => {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Set new timeout
      saveTimeoutRef.current = setTimeout(() => {
        savePage({ content });
      }, 1000);
    },
    [savePage]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setPage((prev) => (prev ? { ...prev, title } : prev));
  };

  const handleTitleBlur = () => {
    if (page) {
      savePage({ title: page.title });
    }
  };

  // Toggle favorite
  const toggleFavorite = () => {
    if (page) {
      const newFavorite = !page.isFavorite;
      setPage((prev) => (prev ? { ...prev, isFavorite: newFavorite } : prev));
      savePage({ isFavorite: newFavorite });
    }
  };

  // Set icon
  const setIcon = (icon: string) => {
    setPage((prev) => (prev ? { ...prev, icon } : prev));
    savePage({ icon });
    setShowEmojiPicker(false);
  };

  // Set color
  const setColor = (color: string | null) => {
    setPage((prev) => (prev ? { ...prev, color } : prev));
    savePage({ color });
    setShowColorPicker(false);
  };

  // Delete page
  const deletePage = async () => {
    if (!confirm("Are you sure you want to delete this page?")) return;
    
    try {
      const res = await fetch(`/api/pages/${pageId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to delete page:", error);
    }
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClick = () => {
      setShowEmojiPicker(false);
      setShowColorPicker(false);
      setShowMenu(false);
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

  if (!page) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-[var(--muted)] mb-4">Page not found</p>
        <Link
          href="/dashboard"
          className="text-garden-600 hover:text-garden-700 transition-colors"
        >
          Go back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 animate-fade-in">
      {/* Color accent bar at top */}
      {page.color && (
        <div 
          className="h-1 -mx-8 -mt-8 mb-8 rounded-t-lg"
          style={{ backgroundColor: page.color }}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/dashboard"
          className="p-2 rounded-lg hover:bg-[var(--card-hover)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        {page.folder && (
          <Link
            href={`/folder/${page.folder.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[var(--card)] border border-[var(--border)] rounded-lg hover:border-garden-500/50 transition-colors"
          >
            <FolderOpen className="w-4 h-4 text-[var(--muted)]" />
            <span>{page.folder.icon}</span>
            <span>{page.folder.name}</span>
          </Link>
        )}

        <div className="flex-1" />

        {/* Save indicator */}
        <span className="text-sm text-[var(--muted)] flex items-center gap-1 min-w-[70px]">
          {saveStatus === "saving" && (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving...
            </>
          )}
          {saveStatus === "saved" && (
            <>
              <Check className="w-3 h-3 text-garden-500" />
              Saved
            </>
          )}
        </span>

        {/* Color button */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowColorPicker(!showColorPicker);
              setShowEmojiPicker(false);
              setShowMenu(false);
            }}
            className={`p-2 rounded-lg transition-colors ${
              page.color 
                ? "ring-2 ring-offset-2 ring-current"
                : "hover:bg-[var(--card-hover)]"
            }`}
            style={page.color ? { 
              backgroundColor: page.color,
              color: 'white',
            } : undefined}
            title={page.color ? COLOR_NAMES[page.color] || "Custom color" : "Add color"}
          >
            <Palette className="w-5 h-5" />
          </button>

          {showColorPicker && (
            <div
              className="absolute right-0 top-full mt-2 p-3 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl z-50 animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <ColorPicker
                selectedColor={page.color}
                onColorSelect={setColor}
              />
            </div>
          )}
        </div>

        {/* Favorite button */}
        <button
          onClick={toggleFavorite}
          className={`p-2 rounded-lg transition-colors ${
            page.isFavorite
              ? "text-warmth-400"
              : "text-[var(--muted)] hover:text-warmth-400"
          }`}
          title={page.isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Star className={`w-5 h-5 ${page.isFavorite ? "fill-current" : ""}`} />
        </button>

        {/* More menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
              setShowEmojiPicker(false);
              setShowColorPicker(false);
            }}
            className="p-2 rounded-lg hover:bg-[var(--card-hover)] transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 top-full mt-1 w-48 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xl py-1 z-50 animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={deletePage}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete page
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Page icon and title */}
      <div className="flex items-start gap-4 mb-8">
        {/* Icon picker */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowEmojiPicker(!showEmojiPicker);
              setShowColorPicker(false);
              setShowMenu(false);
            }}
            className="text-5xl hover:bg-[var(--card-hover)] rounded-xl p-2 transition-colors"
          >
            {page.icon || "📄"}
          </button>

          {showEmojiPicker && (
            <div
              className="absolute left-0 top-full mt-2 p-3 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl z-50 animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-xs text-[var(--muted)] mb-2">Choose an icon</p>
              <div className="grid grid-cols-8 gap-1">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setIcon(emoji)}
                    className="p-2 text-xl hover:bg-[var(--card-hover)] rounded-lg transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Title input */}
        <div className="flex-1">
          <input
            type="text"
            value={page.title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            placeholder="Untitled"
            className="w-full text-4xl font-display font-bold bg-transparent border-none focus:outline-none placeholder:text-[var(--muted)]"
            style={page.color ? { color: page.color } : undefined}
          />
          
          {/* Tags */}
          <div className="mt-3">
            <TagPicker
              pageId={page.id}
              selectedTags={page.tags || []}
              onTagsChange={(tags) => setPage((prev) => prev ? { ...prev, tags } : prev)}
            />
          </div>
          
          <p className="text-sm text-[var(--muted)] mt-2 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Last edited {new Date(page.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Editor - use ref content to avoid re-render loops */}
      <PageEditor
        initialContent={initialContentRef.current}
        onUpdate={handleContentUpdate}
        placeholder="Start writing your thoughts..."
      />
    </div>
  );
}
