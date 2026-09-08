import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card/Card";
import { RegisterForm } from "@/features/auth/RegisterForm";
import { sanitizeReturnTo } from "@/features/auth/return-to";
import { getCurrentUser } from "@/features/auth/session";
import styles from "@/features/auth/AuthForm.module.scss";

export const metadata: Metadata = {
  title: "הרשמה · Tabi",
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

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.intro}>
          <p className={styles.brand}>Tabi</p>
          <h1 className={styles.title}>יצירת חשבון</h1>
          <p className={styles.lede}>התחילו לתכנן את הטיול ביפן.</p>
        </div>
        <Card>
          <RegisterForm nextPath={nextPath} />
        </Card>
        <p className={styles.switch}>
          כבר רשומים?{" "}
          <Link
            href={
              nextPath
                ? `/login?next=${encodeURIComponent(nextPath)}`
                : "/login"
            }
          >
            כניסה
          </Link>
        </p>
      </div>
    </main>
  );
}
