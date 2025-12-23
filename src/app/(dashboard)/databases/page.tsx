"use client";

/**
 * Databases List Page
 * 
 * Shows all databases and allows creating new ones.
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Database,
  Plus,
  Table2,
  ShoppingCart,
  CheckSquare,
  Calendar,
  ArrowRight,
  Loader2,
} from "lucide-react";

interface DatabaseItem {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  updatedAt: string;
  _count: { rows: number };
}

// Template options
const TEMPLATES = [
  { id: "blank", name: "Blank", icon: Table2, description: "Start from scratch" },
  { id: "todo", name: "To-Do List", icon: CheckSquare, description: "Track tasks and priorities" },
  { id: "shopping", name: "Shopping List", icon: ShoppingCart, description: "Items with prices" },
  { id: "tracker", name: "Habit Tracker", icon: Calendar, description: "Track daily habits" },
];

export default function DatabasesPage() {
  const router = useRouter();
  const [databases, setDatabases] = useState<DatabaseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch databases
  useEffect(() => {
    fetchDatabases();
  }, []);

  const fetchDatabases = async () => {
    try {
      const res = await fetch("/api/databases");
      if (res.ok) {
        const data = await res.json();
        setDatabases(data);
      }
    } catch (error) {
      console.error("Failed to fetch databases:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create new database
  const createDatabase = async (template: string) => {
    setIsCreating(true);
    try {
      const res = await fetch("/api/databases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: template === "blank" ? "Untitled Database" : `My ${TEMPLATES.find(t => t.id === template)?.name}`,
          template,
        }),
      });

      if (res.ok) {
        const db = await res.json();
        router.push(`/databases/${db.id}`);
      }
    } catch (error) {
      console.error("Failed to create database:", error);
    } finally {
      setIsCreating(false);
      setShowNewModal(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl text-white">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold">Databases</h1>
            <p className="text-[var(--muted)]">
              Create tables to track anything
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-garden-600 hover:bg-garden-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Database
        </button>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-garden-500 animate-spin" />
        </div>
      ) : databases.length === 0 ? (
        /* Empty state */
        <div className="text-center py-16 bg-[var(--card)] border border-[var(--border)] rounded-xl">
          <Database className="w-16 h-16 text-[var(--muted)] mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No databases yet</h3>
          <p className="text-[var(--muted)] mb-6 max-w-md mx-auto">
            Create your first database to start tracking tasks, habits, shopping lists, and more.
          </p>
          <button
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-garden-600 hover:bg-garden-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Database
          </button>
        </div>
      ) : (
        /* Database grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {databases.map((db, index) => (
            <Link
              key={db.id}
              href={`/databases/${db.id}`}
              className="group p-5 bg-[var(--card)] border border-[var(--border)] rounded-xl hover:border-garden-500/50 hover:shadow-lg transition-all animate-fade-in relative overflow-hidden"
              style={{ 
                animationDelay: `${index * 0.05}s`,
                borderColor: db.color ? `${db.color}50` : undefined,
              }}
            >
              {/* Color accent */}
              {db.color && (
                <div 
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: db.color }}
                />
              )}
              
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{db.icon || "📊"}</span>
                <ArrowRight className="w-5 h-5 text-[var(--muted)] group-hover:text-garden-500 group-hover:translate-x-1 transition-all" />
              </div>
              
              <h3 
                className="font-semibold mb-1 group-hover:text-garden-600 transition-colors"
                style={db.color ? { color: db.color } : undefined}
              >
                {db.name}
              </h3>
              <p className="text-sm text-[var(--muted)]">
                {db._count.rows} {db._count.rows === 1 ? "row" : "rows"}
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* New database modal */}
      {showNewModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowNewModal(false)}
        >
          <div 
            className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-lg animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-2">Create Database</h2>
            <p className="text-[var(--muted)] mb-6">Choose a template to get started</p>
            
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => createDatabase(template.id)}
                  disabled={isCreating}
                  className="p-4 bg-[var(--background)] border border-[var(--border)] rounded-xl hover:border-garden-500/50 hover:bg-[var(--card-hover)] transition-all text-left disabled:opacity-50"
                >
                  <template.icon className="w-8 h-8 text-garden-500 mb-3" />
                  <h3 className="font-medium mb-1">{template.name}</h3>
                  <p className="text-sm text-[var(--muted)]">{template.description}</p>
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setShowNewModal(false)}
              className="w-full mt-4 px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--card-hover)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

