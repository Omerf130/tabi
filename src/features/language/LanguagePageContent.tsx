import { AppPage } from "@/features/app-shell/AppPage";
import { LanguagePageClient } from "./LanguagePage.client";
import type { LanguagePageViewModel } from "./types";

type LanguagePageContentProps = LanguagePageViewModel & {
  initialCategory?: string | null;
  showFavorites?: boolean;
};

export function LanguagePageContent(props: LanguagePageContentProps) {
  return (
    <AppPage width="content">
      <LanguagePageClient {...props} />
    </AppPage>
  );
}
