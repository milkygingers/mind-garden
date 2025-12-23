"use client";

/**
 * Page Link Picker Component
 * 
 * A modal/dropdown to search and select pages to link to
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, FileText, Link2, X } from "lucide-react";

interface PageResult {
  id: string;
  title: string;
  icon: string | null;
  color: string | null;
  folder: { name: string; icon: string | null } | null;
}

interface PageLinkPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (page: PageResult) => void;
  excludePageId?: string;
  position?: { top: number; left: number };
}

export function PageLinkPicker({
  isOpen,
  onClose,
  onSelect,
  excludePageId,
  position,
}: PageLinkPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PageResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
      // Load recent pages immediately
      searchPages("");
    }
  }, [isOpen]);

  // Search pages
  const searchPages = useCallback(async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (excludePageId) params.set("exclude", excludePageId);

      const res = await fetch(`/api/pages/search?${params}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        setSelectedIndex(0);
      }
    } catch (error) {
      console.error("Failed to search pages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [excludePageId]);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      searchPages(query);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen, searchPages]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (results[selectedIndex]) {
          onSelect(results[selectedIndex]);
        }
        break;
      case "Escape":
        onClose();
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Picker */}
      <div
        className="fixed z-50 w-80 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden animate-fade-in"
        style={position ? { top: position.top, left: position.left } : { top: "20%", left: "50%", transform: "translateX(-50%)" }}
      >
        {/* Header */}
        <div className="p-3 border-b border-[var(--border)] flex items-center gap-2">
          <Link2 className="w-4 h-4 text-[var(--garden-500)]" />
          <span className="text-sm font-medium">Link to Page</span>
          <button
            onClick={onClose}
            className="ml-auto p-1 hover:bg-[var(--card-hover)] rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-2 border-b border-[var(--border)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search pages..."
              className="w-full pl-9 pr-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--garden-500)]"
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="w-5 h-5 border-2 border-[var(--garden-500)]/30 border-t-[var(--garden-500)] rounded-full animate-spin mx-auto" />
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-[var(--muted)]">
              {query ? "No pages found" : "No pages yet"}
            </div>
          ) : (
            <div className="p-1">
              {results.map((page, index) => (
                <button
                  key={page.id}
                  onClick={() => onSelect(page)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
                    ${index === selectedIndex ? "bg-[var(--garden-500)]/10" : "hover:bg-[var(--card-hover)]"}
                  `}
                >
                  <span className="text-lg flex-shrink-0">
                    {page.icon || "📄"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p 
                      className="font-medium truncate text-sm"
                      style={page.color ? { color: page.color } : undefined}
                    >
                      {page.title || "Untitled"}
                    </p>
                    {page.folder && (
                      <p className="text-xs text-[var(--muted)] truncate">
                        {page.folder.icon} {page.folder.name}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-3 py-2 border-t border-[var(--border)] bg-[var(--background)] text-xs text-[var(--muted)]">
          <span className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-[var(--card)] border border-[var(--border)] rounded">↑↓</kbd>
            navigate
            <kbd className="px-1.5 py-0.5 bg-[var(--card)] border border-[var(--border)] rounded ml-2">↵</kbd>
            select
          </span>
        </div>
      </div>
    </>
  );
}

// Inline page link component for display
export function PageLink({
  pageId,
  title,
  icon,
  color,
}: {
  pageId: string;
  title: string;
  icon?: string | null;
  color?: string | null;
}) {
  return (
    <a
      href={`/page/${pageId}`}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[var(--card-hover)] hover:bg-[var(--garden-500)]/10 rounded text-sm transition-colors"
      style={color ? { color } : undefined}
    >
      <span>{icon || "📄"}</span>
      <span className="underline decoration-dotted">{title}</span>
    </a>
  );
}

