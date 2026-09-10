import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthDivider } from "@/features/auth/AuthDivider";
import { AuthPageShell } from "@/features/auth/AuthPageShell";
import { GoogleSignInButton } from "@/features/auth/GoogleSignInButton";
import { LoginForm } from "@/features/auth/LoginForm";
import { sanitizeReturnTo } from "@/features/auth/return-to";
import { getCurrentUser } from "@/features/auth/session";

export const metadata: Metadata = {
  title: "Sign in · Tabi",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const user = await getCurrentUser();
  const { next, error } = await searchParams;
  const nextPath = sanitizeReturnTo(next);
  const googleError = error === "google";

  if (user) {
    redirect(nextPath ?? "/app");
  }

  const registerHref = nextPath
    ? `/register?next=${encodeURIComponent(nextPath)}`
    : "/register";

  return (
    <AuthPageShell
      title="Welcome back"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href={registerHref}>Create account</Link>
        </>
      }
    >
      <GoogleSignInButton nextPath={nextPath} />
      <AuthDivider />
      <LoginForm nextPath={nextPath} googleError={googleError} />
    </AuthPageShell>
  );
}
