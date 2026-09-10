import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  sassOptions: {
    loadPaths: ["src/styles"],
  },
  serverExternalPackages: ["argon2", "google-auth-library", "mongoose"],
  // Parent git metadata lives in the user home directory; keep Turbopack
  // scoped to this project without relying on that repository.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
