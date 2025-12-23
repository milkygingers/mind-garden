/**
 * Authentication Configuration
 * 
 * This file sets up NextAuth.js for handling user login/signup.
 * We're using email + password authentication (Credentials Provider).
 */

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  // Connect NextAuth to our database
  adapter: PrismaAdapter(db) as NextAuthOptions["adapter"],

  // Use JWT for sessions (works better with Credentials provider)
  session: {
    strategy: "jwt",
  },

  // Custom pages (we'll create these)
  pages: {
    signIn: "/login",
    // signUp: "/signup", // Custom signup page
  },

  // Authentication providers
  providers: [
    // Email + Password login
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      // This function validates the login
      async authorize(credentials) {
        // Check if email and password were provided
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }

        // Find the user in the database
        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        // Check if user exists
        if (!user || !user.hashedPassword) {
          throw new Error("No account found with this email");
        }

        // Check if password is correct
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isPasswordValid) {
          throw new Error("Incorrect password");
        }

        // Return user data (this becomes the session)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],

  // Callbacks to customize the session/token
  callbacks: {
    // Add user ID to the JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    // Add user ID to the session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

