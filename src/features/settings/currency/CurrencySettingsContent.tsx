import { requireUser } from "@/features/auth/session";
import { AppPage } from "@/features/app-shell/AppPage";
import { getSupportedCurrencies } from "@/features/currency/queries";
import {
  getOrCreateTripFinanceSettings,
  tripHasExpenses,
} from "@/features/finance/finance-settings-domain";
import { requireTripMember } from "@/features/trips/authorization";
import { CurrencySettingsClient } from "./CurrencySettings.client";

type CurrencySettingsContentProps = {
  tripId: string;
};

export async function CurrencySettingsContent({
  tripId,
}: CurrencySettingsContentProps) {
  const [trip, user, settings, hasExpenses, currencies] = await Promise.all([
    requireTripMember(tripId),
    requireUser(),
    getOrCreateTripFinanceSettings(tripId),
    tripHasExpenses(tripId),
    getSupportedCurrencies(),
  ]);

  return (
    <AppPage width="wide" density="compact">
      <CurrencySettingsClient
        tripId={trip.id}
        isOwner={trip.role === "owner"}
        tripBaseCurrency={settings.baseCurrency}
        baseCurrencyLocked={hasExpenses}
        homeCurrency={user.homeCurrency}
        currencies={currencies}
      />
    </AppPage>
  );
}
