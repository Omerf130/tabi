import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AuthDivider } from "@/features/auth/AuthDivider";
import { AuthPageShell } from "@/features/auth/AuthPageShell";
import { GoogleSignInButton } from "@/features/auth/GoogleSignInButton";
import { LoginForm } from "@/features/auth/LoginForm";
import { sanitizeReturnTo } from "@/features/auth/return-to";
import { getCurrentUser } from "@/features/auth/session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth.login");

  return {
    title: t("metadataTitle"),
  };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const t = await getTranslations("Auth");
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
      brandName={t("brandName")}
      title={t("login.title")}
      subtitle={t("login.subtitle")}
      footer={
        <>
          {t("login.footerPrompt")}{" "}
          <Link href={registerHref}>{t("login.footerLink")}</Link>
        </>
      }
    >
      <GoogleSignInButton nextPath={nextPath} />
      <AuthDivider />
      <LoginForm nextPath={nextPath} googleError={googleError} />
    </AuthPageShell>
  );
}
