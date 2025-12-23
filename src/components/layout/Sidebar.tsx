"use client";

/**
 * Sidebar Component
 * 
 * The main navigation sidebar with:
 * - User profile
 * - Search
 * - PARA folders with color coding
 * - Quick actions
 */

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Leaf,
  Search,
  Plus,
  ChevronRight,
  ChevronDown,
  FileText,
  LogOut,
  Star,
  Moon,
  Sun,
  FolderPlus,
  Trash2,
  Edit3,
  Palette,
} from "lucide-react";
import { ColorPicker, ColorDot } from "@/components/ui/ColorPicker";

// Types for our data
interface Page {
  id: string;
  title: string;
  icon: string | null;
  color: string | null;
}

interface Folder {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  isDefault: boolean;
  folderType: string | null;
  parentId?: string | null;
  pages: Page[];
  children?: Folder[];
}

export function Sidebar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  const [folders, setFolders] = useState<Folder[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [contextMenu, setContextMenu] = useState<{ folderId: string; x: number; y: number } | null>(null);
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [colorPickerFolder, setColorPickerFolder] = useState<string | null>(null);

  // Fetch folders - memoized to prevent recreation
  const fetchFolders = useCallback(async () => {
    try {
      const res = await fetch("/api/folders");
      if (res.ok) {
        const data = await res.json();
        setFolders(data);
        // Only set expanded folders on first load
        setExpandedFolders((prev) => {
          if (prev.size === 0) {
            return new Set(
              data.filter((f: Folder) => f.isDefault).map((f: Folder) => f.id)
            );
          }
          return prev;
        });
      }
    } catch (error) {
      console.error("Failed to fetch folders:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch folders on mount only
  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  // Check dark mode preference on mount
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }, []);

  const toggleDarkMode = useCallback(() => {
    const html = document.documentElement;
    html.classList.toggle("dark");
    setIsDark((prev) => !prev);
  }, []);

  const handleNewPage = useCallback(async (folderId?: string) => {
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId }),
      });
      if (res.ok) {
        const page = await res.json();
        fetchFolders(); // Refresh sidebar
        router.push(`/page/${page.id}`);
      }
    } catch (error) {
      console.error("Failed to create page:", error);
    }
  }, [fetchFolders, router]);

  const handleNewFolder = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName, icon: "📁" }),
      });
      if (res.ok) {
        setNewFolderName("");
        setShowNewFolderInput(false);
        fetchFolders();
      }
    } catch (error) {
      console.error("Failed to create folder:", error);
    }
  }, [newFolderName, fetchFolders]);

  const handleDeleteFolder = useCallback(async (folderId: string) => {
    try {
      const res = await fetch(`/api/folders/${folderId}`, { method: "DELETE" });
      if (res.ok) {
        fetchFolders();
      }
    } catch (error) {
      console.error("Failed to delete folder:", error);
    }
    setContextMenu(null);
  }, [fetchFolders]);

  const handleRenameFolder = useCallback(async (folderId: string) => {
    if (!editingName.trim()) {
      setEditingFolder(null);
      return;
    }

    try {
      const res = await fetch(`/api/folders/${folderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName }),
      });
      if (res.ok) {
        fetchFolders();
      }
    } catch (error) {
      console.error("Failed to rename folder:", error);
    }
    setEditingFolder(null);
  }, [editingName, fetchFolders]);

  const handleColorChange = useCallback(async (folderId: string, color: string | null) => {
    try {
      const res = await fetch(`/api/folders/${folderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ color }),
      });
      if (res.ok) {
        fetchFolders();
      }
    } catch (error) {
      console.error("Failed to update folder color:", error);
    }
    setColorPickerFolder(null);
    setContextMenu(null);
  }, [fetchFolders]);

  const startEditing = useCallback((folder: Folder) => {
    setEditingFolder(folder.id);
    setEditingName(folder.name);
    setContextMenu(null);
  }, []);

  const openColorPicker = useCallback((folderId: string) => {
    setColorPickerFolder(folderId);
    setContextMenu(null);
  }, []);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
      setColorPickerFolder(null);
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  // Filter to only show root-level folders
  const rootFolders = folders.filter(f => !f.parentId);

  return (
    <aside className="w-64 h-screen bg-[var(--card)] border-r border-[var(--border)] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <Leaf className="w-6 h-6 text-garden-500 group-hover:rotate-12 transition-transform" />
            <span className="font-display font-bold text-lg">Mind Garden</span>
          </Link>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-[var(--card-hover)] transition-colors"
            title={isDark ? "Light mode" : "Dark mode"}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-garden-500/50"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-3 mb-2">
        <button
          onClick={() => handleNewPage()}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-[var(--card-hover)] transition-colors text-garden-600"
        >
          <Plus className="w-4 h-4" />
          New Page
        </button>
      </div>

      {/* Favorites */}
      <div className="px-3 mb-2">
        <Link
          href="/favorites"
          className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
            pathname === "/favorites"
              ? "bg-garden-500/10 text-garden-600"
              : "hover:bg-[var(--card-hover)]"
          }`}
        >
          <Star className="w-4 h-4" />
          Favorites
        </Link>
      </div>

      {/* Folders */}
      <div className="flex-1 overflow-y-auto px-3">
        {/* Section header */}
        <div className="flex items-center justify-between px-3 py-2 text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
          <span>Folders</span>
          <button
            onClick={() => setShowNewFolderInput(true)}
            className="p-1 rounded hover:bg-[var(--card-hover)] transition-colors"
            title="New folder"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* New folder input */}
        {showNewFolderInput && (
          <form onSubmit={handleNewFolder} className="px-3 mb-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name..."
              autoFocus
              onBlur={() => {
                if (!newFolderName.trim()) {
                  setShowNewFolderInput(false);
                }
              }}
              className="w-full px-2 py-1.5 text-sm bg-[var(--background)] border border-garden-500 rounded focus:outline-none"
            />
          </form>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-garden-500/30 border-t-garden-500 rounded-full animate-spin" />
          </div>
        ) : (
          <nav className="space-y-0.5">
            {rootFolders.map((folder) => (
              <FolderItem
                key={folder.id}
                folder={folder}
                isExpanded={expandedFolders.has(folder.id)}
                onToggle={() => toggleFolder(folder.id)}
                onNewPage={() => handleNewPage(folder.id)}
                pathname={pathname}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({ folderId: folder.id, x: e.clientX, y: e.clientY });
                }}
                isEditing={editingFolder === folder.id}
                editingName={editingName}
                onEditNameChange={setEditingName}
                onEditSubmit={() => handleRenameFolder(folder.id)}
                showColorPicker={colorPickerFolder === folder.id}
                onColorChange={(color) => handleColorChange(folder.id, color)}
              />
            ))}
          </nav>
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xl py-1 min-w-[160px] animate-fade-in"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              const folder = folders.find(f => f.id === contextMenu.folderId);
              if (folder) startEditing(folder);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--card-hover)] transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Rename
          </button>
          <button
            onClick={() => openColorPicker(contextMenu.folderId)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--card-hover)] transition-colors"
          >
            <Palette className="w-4 h-4" />
            Change color
          </button>
          <button
            onClick={() => handleDeleteFolder(contextMenu.folderId)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}

      {/* User section */}
      <div className="p-3 border-t border-[var(--border)]">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-garden-500 flex items-center justify-center text-white font-medium">
            {session?.user?.name?.[0] || session?.user?.email?.[0] || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {session?.user?.name || "User"}
            </p>
            <p className="text-xs text-[var(--muted)] truncate">
              {session?.user?.email}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-2 rounded-lg hover:bg-[var(--card-hover)] text-[var(--muted)] hover:text-red-500 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

// Individual folder component
interface FolderItemProps {
  folder: Folder;
  isExpanded: boolean;
  onToggle: () => void;
  onNewPage: () => void;
  pathname: string;
  onContextMenu: (e: React.MouseEvent) => void;
  isEditing: boolean;
  editingName: string;
  onEditNameChange: (name: string) => void;
  onEditSubmit: () => void;
  showColorPicker: boolean;
  onColorChange: (color: string | null) => void;
}

function FolderItem({
  folder,
  isExpanded,
  onToggle,
  onNewPage,
  pathname,
  onContextMenu,
  isEditing,
  editingName,
  onEditNameChange,
  onEditSubmit,
  showColorPicker,
  onColorChange,
}: FolderItemProps) {
  const hasContent = folder.pages.length > 0 || (folder.children?.length ?? 0) > 0;

  return (
    <div>
      {/* Folder row */}
      <div
        className="group flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-[var(--card-hover)] transition-colors cursor-pointer"
        style={folder.color ? { 
          backgroundColor: `${folder.color}15`,
          borderLeft: `3px solid ${folder.color}`,
        } : undefined}
        onContextMenu={onContextMenu}
      >
        <button
          onClick={onToggle}
          className="p-0.5 rounded hover:bg-[var(--border)] transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-[var(--muted)]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[var(--muted)]" />
          )}
        </button>
        
        <span className="text-base">{folder.icon || "📁"}</span>
        
        {/* Color dot indicator */}
        {folder.color && <ColorDot color={folder.color} size="sm" />}
        
        {isEditing ? (
          <input
            type="text"
            value={editingName}
            onChange={(e) => onEditNameChange(e.target.value)}
            onBlur={onEditSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") onEditSubmit();
              if (e.key === "Escape") onEditSubmit();
            }}
            autoFocus
            className="flex-1 px-1 py-0.5 text-sm bg-[var(--background)] border border-garden-500 rounded focus:outline-none"
          />
        ) : (
          <span 
            className="flex-1 text-sm truncate" 
            onClick={onToggle}
            style={folder.color ? { color: folder.color } : undefined}
          >
            {folder.name}
          </span>
        )}
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNewPage();
          }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[var(--border)] transition-all"
          title="Add page"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Color picker dropdown */}
      {showColorPicker && (
        <div 
          className="ml-6 mt-1 p-3 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xl animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <ColorPicker
            selectedColor={folder.color}
            onColorSelect={onColorChange}
            showLabel={false}
          />
        </div>
      )}

      {/* Children (pages and subfolders) */}
      {isExpanded && (
        <div className="ml-4 pl-2 border-l border-[var(--border)]">
          {/* Pages */}
          {folder.pages.map((page) => (
            <Link
              key={page.id}
              href={`/page/${page.id}`}
              className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg transition-colors ${
                pathname === `/page/${page.id}`
                  ? "bg-garden-500/10 text-garden-600"
                  : "hover:bg-[var(--card-hover)] text-[var(--muted)]"
              }`}
              style={page.color && pathname !== `/page/${page.id}` ? {
                borderLeft: `2px solid ${page.color}`,
                paddingLeft: '6px',
              } : undefined}
            >
              {page.icon ? (
                <span className="text-base">{page.icon}</span>
              ) : (
                <FileText className="w-4 h-4" />
              )}
              {page.color && <ColorDot color={page.color} size="sm" />}
              <span className="truncate">{page.title}</span>
            </Link>
          ))}
          
          {/* Empty state */}
          {!hasContent && (
            <p className="px-2 py-1.5 text-xs text-[var(--muted)] italic">
              No pages yet
            </p>
          )}
        </div>
      )}
    </div>
  );
}
