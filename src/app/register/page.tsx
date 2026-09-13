import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AuthDivider } from "@/features/auth/AuthDivider";
import { AuthPageShell } from "@/features/auth/AuthPageShell";
import { GoogleSignInButton } from "@/features/auth/GoogleSignInButton";
import { RegisterForm } from "@/features/auth/RegisterForm";
import { sanitizeReturnTo } from "@/features/auth/return-to";
import { getCurrentUser } from "@/features/auth/session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth.register");

  return {
    title: t("metadataTitle"),
  };
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const t = await getTranslations("Auth");
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
      brandName={t("brandName")}
      title={t("register.title")}
      subtitle={t("register.subtitle")}
      footer={
        <>
          {t("register.footerPrompt")}{" "}
          <Link href={loginHref}>{t("register.footerLink")}</Link>
        </>
      }
      legal={t("register.legal")}
    >
      <GoogleSignInButton nextPath={nextPath} />
      <AuthDivider />
      <RegisterForm nextPath={nextPath} />
    </AuthPageShell>
  );
}
