"use client";

/**
 * Session Provider
 * 
 * This wraps the app with NextAuth's session context.
 * It allows any component to access the logged-in user.
 */

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

interface Props {
  children: React.ReactNode;
}

export function SessionProvider({ children }: Props) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}

