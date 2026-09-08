import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card/Card";
import { LoginForm } from "@/features/auth/LoginForm";
import { sanitizeReturnTo } from "@/features/auth/return-to";
import { getCurrentUser } from "@/features/auth/session";
import styles from "@/features/auth/AuthForm.module.scss";

export const metadata: Metadata = {
  title: "כניסה · Tabi",
};

export default async function LoginPage({
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
          <h1 className={styles.title}>כניסה</h1>
          <p className={styles.lede}>המשיכו מאיפה שעצרתם.</p>
        </div>
        <Card>
          <LoginForm nextPath={nextPath} />
        </Card>
        <p className={styles.switch}>
          אין חשבון?{" "}
          <Link
            href={
              nextPath
                ? `/register?next=${encodeURIComponent(nextPath)}`
                : "/register"
            }
          >
            הרשמה
          </Link>
        </p>
      </div>
    </main>
  );
}
