/**
 * Landing Page
 * 
 * The public homepage that introduces Mind Garden.
 */

import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Leaf,
  ArrowRight,
  FolderTree,
  FileEdit,
  CheckSquare,
  BarChart3,
  Sparkles,
  Moon,
} from "lucide-react";

export default async function HomePage() {
  // If already logged in, redirect to dashboard
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-garden-50 via-white to-warmth-50 dark:from-dark-bg dark:via-dark-card dark:to-dark-bg">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-dark-bg/80 border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Leaf className="w-7 h-7 text-garden-500 group-hover:rotate-12 transition-transform" />
            <span className="font-display text-xl font-bold">Mind Garden</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium hover:text-garden-600 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 text-sm font-medium bg-garden-600 hover:bg-garden-700 text-white rounded-full transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-garden-100 dark:bg-garden-900/30 text-garden-700 dark:text-garden-300 rounded-full text-sm mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4" />
          Personal productivity, reimagined
        </div>

        <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          Cultivate your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-garden-600 to-warmth-500">
            thoughts
          </span>
        </h1>

        <p className="text-xl text-[var(--muted)] max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          A beautiful personal organization app inspired by Notion, Obsidian, and bullet journaling.
          Organize with PARA, track habits, and grow your knowledge garden.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <Link
            href="/signup"
            className="flex items-center gap-2 px-8 py-4 bg-garden-600 hover:bg-garden-700 text-white font-medium rounded-full transition-all shadow-lg shadow-garden-500/25 hover:shadow-xl hover:shadow-garden-500/30 group"
          >
            Start for free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="#features"
            className="flex items-center gap-2 px-8 py-4 border border-[var(--border)] hover:border-garden-500/50 rounded-full transition-colors"
          >
            Learn more
          </Link>
        </div>

        {/* Hero image placeholder */}
        <div className="mt-16 relative animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <div className="aspect-video max-w-4xl mx-auto bg-gradient-to-br from-garden-100 to-warmth-100 dark:from-dark-card dark:to-dark-hover rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-[var(--border)] bg-white/50 dark:bg-dark-bg/50 flex items-center gap-2">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
            </div>
            <div className="flex h-[calc(100%-52px)]">
              {/* Sidebar preview */}
              <div className="w-56 border-r border-[var(--border)] bg-white/30 dark:bg-dark-bg/30 p-4">
                <div className="flex items-center gap-2 mb-6">
                  <Leaf className="w-5 h-5 text-garden-500" />
                  <span className="font-semibold text-sm">Mind Garden</span>
                </div>
                {["🎯 Projects", "🌱 Areas", "📚 Resources", "📦 Archive"].map((item, i) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm rounded mb-1 animate-slide-in"
                    style={{ animationDelay: `${0.6 + i * 0.1}s` }}
                  >
                    {item}
                  </div>
                ))}
              </div>
              {/* Content preview */}
              <div className="flex-1 p-6">
                <div className="text-3xl mb-2">📝</div>
                <div className="h-6 w-48 bg-[var(--border)] rounded mb-4 animate-pulse" />
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-3 bg-[var(--border)] rounded animate-pulse"
                      style={{ width: `${80 - i * 15}%`, animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white dark:bg-dark-card">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">
              Everything you need to stay organized
            </h2>
            <p className="text-[var(--muted)] text-lg max-w-2xl mx-auto">
              Built with care for personal productivity enthusiasts who want a
              simple yet powerful system.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: FolderTree,
                title: "PARA Organization",
                description:
                  "Projects, Areas, Resources, Archive. The proven system for organizing your digital life.",
              },
              {
                icon: FileEdit,
                title: "Rich Page Editor",
                description:
                  "Write with headings, lists, checklists, quotes, and code blocks. Everything you need.",
              },
              {
                icon: CheckSquare,
                title: "Habit Tracking",
                description:
                  "Build better habits with visual trackers. See your progress over time.",
              },
              {
                icon: BarChart3,
                title: "Custom Databases",
                description:
                  "Create tables for anything: shopping lists, wishlists, study plans, and more.",
              },
              {
                icon: Moon,
                title: "Dark & Light Themes",
                description:
                  "Easy on the eyes, day or night. Seasonal themes coming soon.",
              },
              {
                icon: Sparkles,
                title: "AI Features",
                description:
                  "Optional AI summaries and auto-tagging. You control when AI helps.",
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="p-6 bg-[var(--background)] rounded-2xl border border-[var(--border)] hover:border-garden-500/50 hover:shadow-lg transition-all animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-12 h-12 bg-garden-100 dark:bg-garden-900/30 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-garden-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-[var(--muted)]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="p-12 bg-gradient-to-r from-garden-600 to-garden-700 rounded-3xl shadow-2xl shadow-garden-500/20">
            <Leaf className="w-16 h-16 text-white/80 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Ready to grow your Mind Garden?
            </h2>
            <p className="text-garden-100 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of people who use Mind Garden to organize their thoughts,
              track their habits, and achieve their goals.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-garden-700 font-medium rounded-full transition-colors group"
            >
              Create your garden
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-garden-500" />
            <span className="font-display font-bold">Mind Garden</span>
          </div>
          <p className="text-sm text-[var(--muted)]">
            Built with 💚 for personal productivity
          </p>
        </div>
      </footer>
    </div>
  );
}

