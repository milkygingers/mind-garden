/**
 * Dashboard Page
 * 
 * The main home page after login.
 * Shows a welcome message and recent activity.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { FileText, Clock, Star, Leaf, ArrowRight, Plus } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  // Fetch recent pages
  const recentPages = await db.page.findMany({
    where: { userId: session?.user?.id },
    orderBy: { updatedAt: "desc" },
    take: 6,
    include: {
      folder: { select: { name: true, icon: true, color: true } },
    },
  });

  // Get folder counts
  const folders = await db.folder.findMany({
    where: { userId: session?.user?.id, isDefault: true },
    include: { _count: { select: { pages: true } } },
    orderBy: { order: "asc" },
  });

  // Get time-based greeting
  const hour = new Date().getHours();
  let greeting = "Good morning";
  if (hour >= 12 && hour < 17) greeting = "Good afternoon";
  if (hour >= 17) greeting = "Good evening";

  const userName = session?.user?.name?.split(" ")[0] || "there";

  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* Header */}
      <div className="mb-10 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <Leaf className="w-10 h-10 text-garden-500" />
          <div>
            <h1 className="text-3xl font-display font-bold">
              {greeting}, {userName}
            </h1>
            <p className="text-[var(--muted)]">
              Welcome back to your Mind Garden
            </p>
          </div>
        </div>
      </div>

      {/* PARA Folders Overview */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          Your Workspace
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {folders.map((folder, index) => (
            <Link
              key={folder.id}
              href={`/folder/${folder.id}`}
              className="group p-5 bg-[var(--card)] border border-[var(--border)] rounded-xl hover:shadow-lg transition-all animate-fade-in overflow-hidden relative"
              style={{ 
                animationDelay: `${index * 0.1}s`,
                borderColor: folder.color ? `${folder.color}50` : undefined,
              }}
            >
              {/* Color accent bar */}
              {folder.color && (
                <div 
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: folder.color }}
                />
              )}
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{folder.icon}</span>
                <ArrowRight className="w-5 h-5 text-[var(--muted)] group-hover:text-garden-500 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 
                className="font-semibold mb-1"
                style={folder.color ? { color: folder.color } : undefined}
              >
                {folder.name}
              </h3>
              <p className="text-sm text-[var(--muted)]">
                {folder._count.pages} {folder._count.pages === 1 ? "page" : "pages"}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Pages */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--muted)]" />
            Recent Pages
          </h2>
          <Link
            href="/all-pages"
            className="text-sm text-garden-600 hover:text-garden-700 transition-colors"
          >
            View all
          </Link>
        </div>

        {recentPages.length === 0 ? (
          <div className="text-center py-12 bg-[var(--card)] border border-[var(--border)] rounded-xl animate-fade-in">
            <FileText className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No pages yet</h3>
            <p className="text-[var(--muted)] mb-4">
              Create your first page to get started
            </p>
            <Link
              href="/new-page"
              className="inline-flex items-center gap-2 px-4 py-2 bg-garden-600 hover:bg-garden-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Page
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentPages.map((page, index) => (
              <Link
                key={page.id}
                href={`/page/${page.id}`}
                className="group p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl hover:shadow-md transition-all animate-fade-in overflow-hidden relative"
                style={{ 
                  animationDelay: `${index * 0.05}s`,
                  borderColor: page.color ? `${page.color}50` : undefined,
                }}
              >
                {/* Color accent bar */}
                {page.color && (
                  <div 
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: page.color }}
                  />
                )}
                <div className="flex items-start gap-3">
                  <span className="text-2xl">
                    {page.icon || "📄"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="font-medium truncate group-hover:text-garden-600 transition-colors"
                      style={page.color ? { color: page.color } : undefined}
                    >
                      {page.title}
                    </h3>
                    {page.folder && (
                      <p className="text-sm text-[var(--muted)] flex items-center gap-1 mt-1">
                        {page.folder.color && (
                          <span 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: page.folder.color }}
                          />
                        )}
                        <span>{page.folder.icon}</span>
                        {page.folder.name}
                      </p>
                    )}
                    <p className="text-xs text-[var(--muted)] mt-2">
                      Updated {formatRelativeTime(page.updatedAt)}
                    </p>
                  </div>
                  {page.isFavorite && (
                    <Star className="w-4 h-4 text-warmth-400 fill-warmth-400" />
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Quick Tips */}
      <section className="mt-10 p-6 bg-gradient-to-r from-garden-50 to-warmth-50 dark:from-garden-900/20 dark:to-warmth-900/20 border border-garden-200 dark:border-garden-800 rounded-xl animate-fade-in">
        <h3 className="font-semibold mb-3 text-garden-800 dark:text-garden-200">
          💡 Quick Tips
        </h3>
        <ul className="space-y-2 text-sm text-garden-700 dark:text-garden-300">
          <li>• <strong>Right-click</strong> folders to change their color</li>
          <li>• Click the <strong>palette icon</strong> on pages to add color</li>
          <li>• Use <strong>Projects</strong> for active goals with deadlines</li>
          <li>• Use <strong>Archive</strong> for completed or inactive items</li>
        </ul>
      </section>
    </div>
  );
}

// Helper function to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return new Date(date).toLocaleDateString();
}
