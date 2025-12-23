/**
 * Folder View Page
 * 
 * Shows all pages in a specific folder.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, ArrowRight, FolderOpen } from "lucide-react";
import { NewPageButton } from "./NewPageButton";

interface FolderPageProps {
  params: Promise<{ folderId: string }>;
}

export default async function FolderPage({ params }: FolderPageProps) {
  const { folderId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const folder = await db.folder.findFirst({
    where: {
      id: folderId,
      userId: session.user.id,
    },
    include: {
      pages: {
        orderBy: { updatedAt: "desc" },
      },
      children: {
        include: {
          _count: { select: { pages: true } },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!folder) {
    notFound();
  }

  // Get PARA description
  const paraDescriptions: Record<string, string> = {
    project: "Active projects with deadlines and specific outcomes",
    area: "Ongoing responsibilities and areas of life to maintain",
    resource: "Topics of interest and reference materials",
    archive: "Completed projects and inactive items",
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <Link
          href="/dashboard"
          className="p-2 rounded-lg hover:bg-[var(--card-hover)] transition-colors mt-1"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{folder.icon || "📁"}</span>
            <h1 className="text-3xl font-display font-bold">{folder.name}</h1>
          </div>
          {folder.folderType && paraDescriptions[folder.folderType] && (
            <p className="text-[var(--muted)]">
              {paraDescriptions[folder.folderType]}
            </p>
          )}
        </div>

        <NewPageButton folderId={folder.id} />
      </div>

      {/* Subfolders */}
      {folder.children.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wider mb-3">
            Subfolders
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {folder.children.map((subfolder) => (
              <Link
                key={subfolder.id}
                href={`/folder/${subfolder.id}`}
                className="group flex items-center gap-3 p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl hover:border-garden-500/50 hover:shadow-md transition-all"
              >
                <FolderOpen className="w-5 h-5 text-[var(--muted)]" />
                <span className="text-lg">{subfolder.icon || "📁"}</span>
                <span className="flex-1 font-medium truncate">{subfolder.name}</span>
                <span className="text-sm text-[var(--muted)]">
                  {subfolder._count.pages} pages
                </span>
                <ArrowRight className="w-4 h-4 text-[var(--muted)] group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Pages */}
      <section>
        <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wider mb-3">
          Pages
        </h2>

        {folder.pages.length === 0 ? (
          <div className="text-center py-12 bg-[var(--card)] border border-[var(--border)] rounded-xl animate-fade-in">
            <FileText className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No pages in this folder</h3>
            <p className="text-[var(--muted)] mb-4">
              Create your first page to get started
            </p>
            <NewPageButton folderId={folder.id} variant="primary" />
          </div>
        ) : (
          <div className="grid gap-3">
            {folder.pages.map((page, index) => (
              <Link
                key={page.id}
                href={`/page/${page.id}`}
                className="group flex items-center gap-4 p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl hover:border-garden-500/50 hover:shadow-md transition-all animate-fade-in"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <span className="text-2xl">{page.icon || "📄"}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate group-hover:text-garden-600 transition-colors">
                    {page.title}
                  </h3>
                  <p className="text-sm text-[var(--muted)]">
                    Updated {new Date(page.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-[var(--muted)] group-hover:text-garden-600 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

