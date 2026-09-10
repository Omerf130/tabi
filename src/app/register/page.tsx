import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthDivider } from "@/features/auth/AuthDivider";
import { AuthPageShell } from "@/features/auth/AuthPageShell";
import { GoogleSignInButton } from "@/features/auth/GoogleSignInButton";
import { RegisterForm } from "@/features/auth/RegisterForm";
import { sanitizeReturnTo } from "@/features/auth/return-to";
import { getCurrentUser } from "@/features/auth/session";

export const metadata: Metadata = {
  title: "Create account · Tabi",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  const { next } = await searchParams;
  const nextPath = sanitizeReturnTo(next);

  if (user) {
    redirect(nextPath ?? "/app");
  }

  const loginHref = nextPath
    ? `/login?next=${encodeURIComponent(nextPath)}`
    : "/login";

  return (
    <AuthPageShell
      title="Create your account"
      footer={
        <>
          Already have an account? <Link href={loginHref}>Sign in</Link>
        </>
      }
    >
      <GoogleSignInButton nextPath={nextPath} />
      <AuthDivider />
      <RegisterForm nextPath={nextPath} />
    </AuthPageShell>
  );
}
