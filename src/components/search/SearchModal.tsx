"use client";

/**
 * Search Modal Component
 * 
 * A beautiful command palette style search (Cmd+K / Ctrl+K)
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  FileText,
  Database,
  Target,
  Folder,
  ArrowRight,
  Command,
  CornerDownLeft,
} from "lucide-react";

interface SearchResult {
  id: string;
  type: "page" | "database" | "habit" | "folder";
  title: string;
  subtitle: string;
  icon: string;
  color: string | null;
  href: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const typeIcons = {
  page: FileText,
  database: Database,
  habit: Target,
  folder: Folder,
};

const typeLabels = {
  page: "Page",
  database: "Database",
  habit: "Habit",
  folder: "Folder",
};

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Search as you type (debounced)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results);
          setSelectedIndex(0);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
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
            router.push(results[selectedIndex].href);
            onClose();
          }
          break;
        case "Escape":
          onClose();
          break;
      }
    },
    [results, selectedIndex, router, onClose]
  );

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    router.push(result.href);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-[15%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-50 animate-slide-up">
        <div className="bg-[var(--card)] rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-[var(--border)]">
            <Search className="w-5 h-5 text-[var(--muted)]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search pages, databases, habits, folders..."
              className="flex-1 bg-transparent outline-none text-lg placeholder:text-[var(--muted)]"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="p-1 hover:bg-[var(--card-hover)] rounded-lg"
              >
                <X className="w-4 h-4 text-[var(--muted)]" />
              </button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-6 h-6 border-2 border-[var(--garden-500)]/30 border-t-[var(--garden-500)] rounded-full animate-spin mx-auto" />
              </div>
            ) : query && results.length === 0 ? (
              <div className="p-8 text-center">
                <Search className="w-10 h-10 text-[var(--muted)] mx-auto mb-3 opacity-50" />
                <p className="text-[var(--muted)]">No results for &ldquo;{query}&rdquo;</p>
                <p className="text-sm text-[var(--muted)] mt-1">
                  Try different keywords
                </p>
              </div>
            ) : results.length > 0 ? (
              <div className="p-2">
                {/* Group results by type */}
                {(["page", "database", "habit", "folder"] as const).map((type) => {
                  const typeResults = results.filter((r) => r.type === type);
                  if (typeResults.length === 0) return null;

                  const TypeIcon = typeIcons[type];

                  return (
                    <div key={type} className="mb-2">
                      <div className="px-3 py-1.5 text-xs font-medium text-[var(--muted)] uppercase tracking-wider flex items-center gap-2">
                        <TypeIcon className="w-3 h-3" />
                        {typeLabels[type]}s
                      </div>
                      {typeResults.map((result) => {
                        const index = results.indexOf(result);
                        const isSelected = index === selectedIndex;

                        return (
                          <button
                            key={result.id}
                            onClick={() => handleResultClick(result)}
                            onMouseEnter={() => setSelectedIndex(index)}
                            className={`
                              w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left
                              transition-colors
                              ${isSelected ? "bg-[var(--garden-500)]/10" : "hover:bg-[var(--card-hover)]"}
                            `}
                          >
                            {/* Icon */}
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                              style={{
                                backgroundColor: result.color
                                  ? `${result.color}20`
                                  : "var(--background)",
                              }}
                            >
                              {result.icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <p
                                className="font-medium truncate"
                                style={result.color ? { color: result.color } : undefined}
                              >
                                {result.title}
                              </p>
                              <p className="text-sm text-[var(--muted)] truncate">
                                {result.subtitle}
                              </p>
                            </div>

                            {/* Arrow */}
                            {isSelected && (
                              <ArrowRight className="w-4 h-4 text-[var(--garden-500)]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6">
                <p className="text-sm text-[var(--muted)] mb-4">Quick Actions</p>
                <div className="space-y-1">
                  <QuickAction
                    icon="📄"
                    label="New Page"
                    shortcut="P"
                    onClick={() => {
                      router.push("/page/new");
                      onClose();
                    }}
                  />
                  <QuickAction
                    icon="🗃️"
                    label="New Database"
                    shortcut="D"
                    onClick={() => {
                      router.push("/databases");
                      onClose();
                    }}
                  />
                  <QuickAction
                    icon="🎯"
                    label="Habits"
                    shortcut="H"
                    onClick={() => {
                      router.push("/habits");
                      onClose();
                    }}
                  />
                  <QuickAction
                    icon="⏱️"
                    label="Focus Timer"
                    shortcut="T"
                    onClick={() => {
                      router.push("/timer");
                      onClose();
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--background)] flex items-center justify-between text-xs text-[var(--muted)]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-[var(--card)] border border-[var(--border)] rounded text-[10px]">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-[var(--card)] border border-[var(--border)] rounded text-[10px]">↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-[var(--card)] border border-[var(--border)] rounded text-[10px] flex items-center">
                  <CornerDownLeft className="w-2.5 h-2.5" />
                </kbd>
                to select
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-[var(--card)] border border-[var(--border)] rounded text-[10px]">esc</kbd>
              to close
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

// Quick action item
function QuickAction({
  icon,
  label,
  shortcut,
  onClick,
}: {
  icon: string;
  label: string;
  shortcut: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--card-hover)] transition-colors text-left"
    >
      <span className="text-lg">{icon}</span>
      <span className="flex-1">{label}</span>
      <kbd className="px-2 py-0.5 bg-[var(--card)] border border-[var(--border)] rounded text-xs text-[var(--muted)]">
        {shortcut}
      </kbd>
    </button>
  );
}

// Hook to use search modal with keyboard shortcut
export function useSearchModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}

