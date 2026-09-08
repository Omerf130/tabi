"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input/Input";
import { Button } from "@/components/ui/Button/Button";
import styles from "./MembersPage.module.scss";

type CopyInviteUrlProps = {
  inviteUrl: string;
};

export function CopyInviteUrl({ inviteUrl }: CopyInviteUrlProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={styles.copyBlock}>
      <Input readOnly value={inviteUrl} aria-label="קישור הזמנה" />
      <Button type="button" variant="secondary" onClick={handleCopy}>
        {copied ? "קישור הועתק" : "העתקת קישור"}
      </Button>
    </div>
  );
}
