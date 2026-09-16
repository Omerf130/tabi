import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";
import createNextIntlPlugin from "next-intl/plugin";
import path from "node:path";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

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

export default withSerwist(withNextIntl(nextConfig));
