import { AppPage } from "./AppPage";
import styles from "./PlaceholderPage.module.scss";

type PlaceholderPageProps = {
  message: string;
};

export function PlaceholderPage({ message }: PlaceholderPageProps) {
  return (
    <AppPage width="content">
      <p className={styles.message}>{message}</p>
    </AppPage>
  );
}
