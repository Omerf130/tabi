import type { CSSProperties } from "react";
import { MOCK_MEMBERS } from "../mock-data";
import { RouteDecoration } from "../RouteDecoration";
import styles from "../landing.module.scss";

export function CollaborationSection() {
  return (
    <section className={styles.collaboration} aria-labelledby="collaboration-heading">
      <div className={styles.collaborationWarmth} aria-hidden="true" />

      <div className={styles.collaborationGrid}>
        <div className={styles.collaborationCopy}>
          <h2 id="collaboration-heading" className={styles.sectionTitle}>
            הטיול שלכם.
            <span className={styles.titleAccentWarm}> לא רק שלכם.</span>
          </h2>
          <p className={styles.sectionLead}>
            מזמינים את מי שטס איתכם וכולם רואים את אותו הטיול — מסלול, רשימות
            ומידע שימושי משותף.
          </p>
        </div>

        <div className={styles.collaborationVisual} aria-hidden="true">
          <div className={styles.collabAvatars}>
            {MOCK_MEMBERS.map((member, index) => (
              <div
                key={member.initials}
                className={styles.collabAvatar}
                style={{ "--avatar-i": index } as CSSProperties}
                title={member.name}
              >
                {member.initials}
              </div>
            ))}
          </div>

          <RouteDecoration variant="dots" className={styles.collabRoute} />

          <div className={styles.collabSharedCard}>
            <p className={styles.collabSharedLabel}>טיול משותף</p>
            <p className={styles.collabSharedTitle}>Barcelona · 12–19 Sep</p>
            <ul className={styles.collabSharedList}>
              <li>מסלול משותף</li>
              <li>רשימות משותפות</li>
              <li>4 נוסעים</li>
            </ul>
          </div>

          <svg className={styles.collabLines} viewBox="0 0 200 120" aria-hidden="true">
            <path
              d="M30 60 Q 100 20, 170 60"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="4 5"
              opacity="0.4"
            />
            <path
              d="M30 60 Q 100 100, 170 60"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="4 5"
              opacity="0.25"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
