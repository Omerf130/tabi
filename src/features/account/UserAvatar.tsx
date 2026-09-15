import { travelerInitials } from "@/features/trips/settings/travelers/traveler-initials";
import styles from "./UserAvatar.module.scss";

type UserAvatarProps = {
  name: string;
  avatarHref?: string;
  size?: "sm" | "lg";
  className?: string;
};

export function UserAvatar({
  name,
  avatarHref,
  size = "sm",
  className,
}: UserAvatarProps) {
  const rootClass = [
    styles.avatar,
    size === "lg" ? styles.avatarLg : styles.avatarSm,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (avatarHref) {
    return (
      <img
        src={avatarHref}
        alt={name}
        className={rootClass}
        width={size === "lg" ? 96 : 40}
        height={size === "lg" ? 96 : 40}
      />
    );
  }

  return (
    <span className={rootClass} aria-hidden>
      {travelerInitials(name)}
    </span>
  );
}
