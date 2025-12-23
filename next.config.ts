import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable strict mode to prevent double-rendering in development
  reactStrictMode: false,
  
  // Required for Prisma in serverless environments (moved from experimental)
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
};

export default nextConfig;
