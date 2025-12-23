/**
 * Type Definitions for NextAuth
 * 
 * This extends NextAuth's types to include our custom user ID field.
 */

import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}

