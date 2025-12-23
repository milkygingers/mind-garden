/**
 * Favorites Page
 * 
 * Shows all pages marked as favorites.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Star, FileText, ArrowRight } from "lucide-react";

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);

  const favorites = await db.page.findMany({
    where: {
      userId: session?.user?.id,
      isFavorite: true,
    },
    orderBy: { updatedAt: "desc" },
    include: {
      folder: { select: { name: true, icon: true } },
    },
  });

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center gap-3 mb-8">
        <Star className="w-8 h-8 text-warmth-400 fill-warmth-400" />
        <div>
          <h1 className="text-3xl font-display font-bold">Favorites</h1>
          <p className="text-[var(--muted)]">
            Your starred pages for quick access
          </p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16 bg-[var(--card)] border border-[var(--border)] rounded-xl animate-fade-in">
          <Star className="w-16 h-16 text-[var(--muted)] mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
          <p className="text-[var(--muted)] mb-6 max-w-md mx-auto">
            Click the star icon on any page to add it to your favorites for quick access.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-garden-600 hover:text-garden-700 transition-colors"
          >
            Go to dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {favorites.map((page, index) => (
            <Link
              key={page.id}
              href={`/page/${page.id}`}
              className="group flex items-center gap-4 p-5 bg-[var(--card)] border border-[var(--border)] rounded-xl hover:border-garden-500/50 hover:shadow-md transition-all animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <span className="text-3xl">
                {page.icon || "📄"}
              </span>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate group-hover:text-garden-600 transition-colors">
                  {page.title}
                </h3>
                {page.folder && (
                  <p className="text-sm text-[var(--muted)] flex items-center gap-1 mt-1">
                    <span>{page.folder.icon}</span>
                    {page.folder.name}
                  </p>
                )}
              </div>

              <Star className="w-5 h-5 text-warmth-400 fill-warmth-400" />

              <ArrowRight className="w-5 h-5 text-[var(--muted)] group-hover:text-garden-600 group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

