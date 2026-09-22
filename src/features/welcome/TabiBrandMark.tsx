import { TabiLogo } from "@/features/brand/TabiLogo";

type TabiBrandMarkProps = {
  className?: string;
};

/** @deprecated Use `TabiLogo` with an explicit variant. */
export function TabiBrandMark({ className }: TabiBrandMarkProps) {
  return <TabiLogo variant="compact" decorative className={className} />;
}
