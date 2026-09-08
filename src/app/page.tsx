import type { Metadata } from "next";
import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { Card } from "@/components/ui/Card/Card";
import { Field } from "@/components/ui/Field/Field";
import { Input } from "@/components/ui/Input/Input";
import { Select } from "@/components/ui/Select/Select";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import { DesignSystemPreview } from "./DesignSystemPreview";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "מערכת עיצוב · Tabi",
  description: "תצוגה פנימית של מערכת העיצוב. זה אינו דף הבית של המוצר.",
};

export default function DesignSystemPage() {
  return (
    <DesignSystemPreview>
      <main className={styles.main}>
        <p className={styles.kicker}>Tabi · Japan V1</p>
        <p className={styles.lede}>
          תצוגה פנימית של מערכת העיצוב. זה אינו דף הבית של המוצר.
        </p>

        <section className={styles.section} aria-labelledby="palette-heading">
          <h2 id="palette-heading" className={styles.sectionTitle}>
            צבעים
          </h2>
          <div className={styles.swatches}>
            <Swatch name="background" token="var(--color-background)" />
            <Swatch name="surface" token="var(--color-surface)" />
            <Swatch name="primary" token="var(--color-primary)" />
            <Swatch name="accent" token="var(--color-accent)" />
            <Swatch name="text" token="var(--color-text)" />
            <Swatch name="border" token="var(--color-border)" />
          </div>
        </section>

        <section className={styles.section} aria-labelledby="type-heading">
          <h2 id="type-heading" className={styles.sectionTitle}>
            טיפוגרפיה
          </h2>
          <p className={styles.display}>Tabi</p>
          <p className={styles.pageTitle}>כותרת עמוד</p>
          <p className={styles.cardTitle}>כותרת כרטיס</p>
          <p className={styles.bodyCopy}>
            גוף טקסט לקריאה בנסיעה. Beautiful enough to feel special.
          </p>
          <p className={styles.caption}>טקסט משני · caption</p>
          <p className={styles.numeric}>08:42 · ¥12,800</p>
          <p className={styles.mixed} lang="ja" dir="auto">
            東京駅 · Tokyo Station
          </p>
        </section>

        <section className={styles.section} aria-labelledby="buttons-heading">
          <h2 id="buttons-heading" className={styles.sectionTitle}>
            כפתורים
          </h2>
          <div className={styles.row}>
            <Button>ראשי</Button>
            <Button variant="secondary">משני</Button>
            <Button variant="ghost">שקט</Button>
            <Button variant="danger">מחיקה</Button>
          </div>
          <div className={styles.row}>
            <Button size="compact">Compact</Button>
            <Button disabled>מושבת</Button>
            <Button loading>טוען</Button>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="cards-heading">
          <h2 id="cards-heading" className={styles.sectionTitle}>
            כרטיסים
          </h2>
          <div className={styles.cardStack}>
            <Card>
              <p className={styles.cardTitle}>רגיל</p>
              <p className={styles.bodyCopy}>משטח נייר עם קו מתאר עדין.</p>
            </Card>
            <Card variant="elevated">
              <p className={styles.cardTitle}>מורם</p>
              <p className={styles.bodyCopy}>צל חם ושקט, בלי מראה SaaS.</p>
            </Card>
            <Card variant="subtle">
              <p className={styles.cardTitle}>עדין</p>
              <p className={styles.bodyCopy}>רקע שקט לקבוצות תוכן.</p>
            </Card>
            <Card variant="emphasized">
              <p className={styles.cardTitle}>מודגש</p>
              <p className={styles.bodyCopy}>פס בורדו בצד ההתחלה.</p>
            </Card>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="fields-heading">
          <h2 id="fields-heading" className={styles.sectionTitle}>
            שדות
          </h2>
          <div className={styles.fieldStack}>
            <Field label="תחנה" htmlFor="station" hint="אפשר גם באנגלית או ביפנית">
              <Input
                id="station"
                name="station"
                placeholder="שינגוקו"
                aria-describedby="station-hint"
              />
            </Field>
            <Field label="הערה" htmlFor="note">
              <Textarea id="note" name="note" rows={3} placeholder="פרטים לנהג" />
            </Field>
            <Field label="סוג כרטיס" htmlFor="pass">
              <Select id="pass" name="pass" defaultValue="jr">
                <option value="jr">JR Pass</option>
                <option value="suica">Suica</option>
              </Select>
            </Field>
            <Field label="אימייל" htmlFor="email" error="יש להזין כתובת תקינה">
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue="demo"
                aria-invalid="true"
                aria-describedby="email-error"
              />
            </Field>
            <Field label="מושבת" htmlFor="locked">
              <Input id="locked" name="locked" disabled defaultValue="לא ניתן לעריכה" />
            </Field>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="badges-heading">
          <h2 id="badges-heading" className={styles.sectionTitle}>
            תגיות
          </h2>
          <div className={styles.row}>
            <Badge>booked</Badge>
            <Badge tone="accent">JR Pass</Badge>
            <Badge tone="success">Suica</Badge>
            <Badge tone="warning">pending</Badge>
            <Badge tone="danger">offline</Badge>
          </div>
        </section>
      </main>
    </DesignSystemPreview>
  );
}

function Swatch({ name, token }: { name: string; token: string }) {
  return (
    <div className={styles.swatch}>
      <span className={styles.swatchChip} style={{ background: token }} />
      <span className={styles.swatchName}>{name}</span>
    </div>
  );
}
