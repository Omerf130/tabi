import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import styles from "./landing.module.scss";

type MarketingLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: "primary" | "secondary" | "ghost" | "nav";
};

export function MarketingLink({
  variant = "primary",
  className,
  ...rest
}: MarketingLinkProps) {
  const classes = [styles.link, className].filter(Boolean).join(" ");

  return <Link {...rest} className={classes} data-variant={variant} />;
}
