import {
  IconAccommodation,
  IconBell,
  IconCalendar,
  IconCurrency,
  IconDictionary,
  IconDocuments,
  IconFilePdf,
  IconLock,
  IconMail,
  IconMapPin,
  IconMembers,
  IconNavigation,
  IconSettings,
  IconTrain,
} from "@/components/ui/icons";
import type { SettingsRowIconId } from "./types";
import styles from "./SettingsHub.module.scss";

type SettingsHubRowIconProps = {
  icon: SettingsRowIconId;
};

export function SettingsHubRowIcon({ icon }: SettingsHubRowIconProps) {
  const className = styles.rowIconSvg;

  switch (icon) {
    case "tripDetails":
      return <IconSettings className={className} aria-hidden />;
    case "travelers":
      return <IconMembers className={className} aria-hidden />;
    case "theme":
      return <IconCalendar className={className} aria-hidden />;
    case "currency":
      return <IconCurrency className={className} aria-hidden />;
    case "language":
      return <IconDictionary className={className} aria-hidden />;
    case "maps":
      return <IconMapPin className={className} aria-hidden />;
    case "notifications":
      return <IconBell className={className} aria-hidden />;
    case "export":
      return <IconFilePdf className={className} aria-hidden />;
    case "deleteTrip":
      return <IconNavigation className={className} aria-hidden />;
    case "profile":
      return <IconMembers className={className} aria-hidden />;
    case "security":
      return <IconLock className={className} aria-hidden />;
    case "help":
      return <IconMail className={className} aria-hidden />;
    case "accommodations":
      return <IconAccommodation className={className} aria-hidden />;
    case "transport":
      return <IconTrain className={className} aria-hidden />;
    case "documents":
      return <IconDocuments className={className} aria-hidden />;
    case "reminders":
      return <IconBell className={className} aria-hidden />;
    default:
      return <IconSettings className={className} aria-hidden />;
  }
}
