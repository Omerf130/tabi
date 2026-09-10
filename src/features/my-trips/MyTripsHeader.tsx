import Link from "next/link";
import { TabiBrandMark } from "@/features/welcome/TabiBrandMark";
import { CREATE_TRIP_PATH } from "./constants";
import { MyTripsAccountAffordance } from "./MyTripsAccountAffordance";
import styles from "./MyTripsScreen.module.scss";

type MyTripsHeaderProps = {
  userName: string;
  showNewTripAction: boolean;
};

export function MyTripsHeader({
  userName,
  showNewTripAction,
}: MyTripsHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerBrand}>
        <TabiBrandMark className={styles.headerMark} />
        <span className={styles.headerName}>Tabi</span>
      </div>

      <div className={styles.headerActions}>
        {showNewTripAction ? (
          <Link href={CREATE_TRIP_PATH} className={styles.newTripButton}>
            + New Trip
          </Link>
        ) : null}
        <MyTripsAccountAffordance userName={userName} />
      </div>
    </header>
  );
}
