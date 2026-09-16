import { createSerwistRoute } from "@serwist/turbopack";

const revision =
  process.env.VERCEL_GIT_COMMIT_SHA ??
  process.env.VERCEL_DEPLOYMENT_ID ??
  crypto.randomUUID();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    swSrc: "src/app/sw.ts",
    useNativeEsbuild: true,
    globIgnores: ["**/node_modules/**", "public/**"],
    globPatterns: [".next/static/**/*.{js,css,woff2}"],
    additionalPrecacheEntries: [
      { url: "/icons/icon-192.png", revision },
      { url: "/icons/icon-512.png", revision },
      { url: "/offline", revision },
    ],
  });
