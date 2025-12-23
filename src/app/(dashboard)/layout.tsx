/**
 * Dashboard Layout
 * 
 * This layout wraps all authenticated pages.
 * It includes the sidebar and ensures the user is logged in.
 */

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is logged in
  const session = await getServerSession(authOptions);

  if (!session) {
    // Not logged in - redirect to login page
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto bg-[var(--background)]">
        {children}
      </main>
    </div>
  );
}

