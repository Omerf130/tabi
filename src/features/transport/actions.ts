"use server";



import { revalidatePath } from "next/cache";

import { revalidateItineraryPaths } from "@/features/itinerary/revalidation";

import { revalidateTripManagement } from "@/features/trip-management/revalidation";

import { requireTripOwner } from "@/features/trips/authorization";

import { getTransportForTrip } from "./queries";

import { parseSimpleEntityCostFromFormData } from "@/features/finance/entity-cost-schema";

import {

  FinanceExpenseValidationError,

  FrankfurterRequestError,

} from "@/features/finance/finance-expense-domain";

import { revalidateFinancePaths } from "@/features/finance/revalidation";

import {

  TRANSPORT_ERROR_CODES,

  TRANSPORT_SUCCESS_CODES,

  type TransportErrorCode,

  type TransportSuccessCode,

} from "./constants";

import {

  createTransportSchema,

  deleteTransportSchema,

  parseTransportFromFormData,

  updateTransportSchema,

} from "./schemas";

import {

  TransportNotFoundError,

  TransportValidationError,

  createTransport,

  deleteTransport,

  updateTransport,

} from "./transport-domain";



export type TransportActionState = {

  ok?: boolean;

  errorCode?: TransportErrorCode;

  successCode?: TransportSuccessCode;

  transportId?: string;

  fieldErrors?: Record<string, string>;

};



function revalidateTransportPaths(

  tripId: string,

  transportId?: string,

  departureDates: readonly string[] = [],

): void {

  revalidatePath(`/app/trips/${tripId}/transport`);

  revalidateTripManagement(tripId, "transport");

  revalidateItineraryPaths(tripId, departureDates);

  revalidatePath(`/app/trips/${tripId}/more`);

  revalidatePath(`/app/trips/${tripId}/documents`);

  revalidatePath(`/app/trips/${tripId}`);

  if (transportId) {

    revalidatePath(`/app/trips/${tripId}/transport/${transportId}`);

    revalidatePath(`/app/trips/${tripId}/transport/${transportId}/edit`);

  }

}



export async function createTransportAction(

  _prev: TransportActionState,

  formData: FormData,

): Promise<TransportActionState> {

  const parsed = createTransportSchema.safeParse(parseTransportFromFormData(formData));



  if (!parsed.success) {

    return {

      errorCode: TRANSPORT_ERROR_CODES.saveFailed,

      fieldErrors: Object.fromEntries(

        parsed.error.issues.map((issue) => [issue.path.join("."), issue.message]),

      ),

    };

  }



  const costParsed = parseSimpleEntityCostFromFormData(formData);

  if (!costParsed.ok) {

    return {
      errorCode: TRANSPORT_ERROR_CODES.invalidCostData,
      fieldErrors: { costAmount: costParsed.errorCode },
    };

  }



  try {

    const trip = await requireTripOwner(String(formData.get("tripId")));

    const transportId = await createTransport(

      trip.id,

      parsed.data,

      costParsed.value.hasCost ? costParsed.value : null,

    );

    revalidateTransportPaths(trip.id, transportId, [parsed.data.departure.date]);

    revalidateFinancePaths(trip.id);

    return {

      ok: true,

      successCode: TRANSPORT_SUCCESS_CODES.saved,

      transportId,

    };

  } catch (error) {

    if (error instanceof TransportValidationError) {

      return { errorCode: error.code };

    }

    if (error instanceof FinanceExpenseValidationError) {

      return { errorCode: TRANSPORT_ERROR_CODES.saveFailed };

    }

    if (error instanceof FrankfurterRequestError) {

      return { errorCode: TRANSPORT_ERROR_CODES.saveFailed };

    }

    return { errorCode: TRANSPORT_ERROR_CODES.saveFailed };

  }

}



export async function updateTransportAction(

  _prev: TransportActionState,

  formData: FormData,

): Promise<TransportActionState> {

  const parsed = updateTransportSchema.safeParse(parseTransportFromFormData(formData));



  if (!parsed.success) {

    return {

      errorCode: TRANSPORT_ERROR_CODES.saveFailed,

      fieldErrors: Object.fromEntries(

        parsed.error.issues.map((issue) => [issue.path.join("."), issue.message]),

      ),

    };

  }



  const costSync = formData.has("costAmount")

    ? parseSimpleEntityCostFromFormData(formData)

    : null;

  if (costSync && !costSync.ok) {

    return {
      errorCode: TRANSPORT_ERROR_CODES.invalidCostData,
      fieldErrors: { costAmount: costSync.errorCode },
    };

  }



  try {

    const trip = await requireTripOwner(String(formData.get("tripId")));

    const existing = await getTransportForTrip(trip.id, parsed.data.transportId);

    await updateTransport(

      trip.id,

      parsed.data,

      costSync

        ? costSync.value.hasCost

          ? costSync.value

          : null

        : undefined,

    );

    const dates = [

      parsed.data.departure.date,

      existing?.departure.date,

    ].filter((value): value is string => Boolean(value));

    revalidateTransportPaths(trip.id, parsed.data.transportId, dates);

    if (costSync) {

      revalidateFinancePaths(trip.id);

    }

    return { ok: true, successCode: TRANSPORT_SUCCESS_CODES.updated };

  } catch (error) {

    if (error instanceof TransportValidationError) {

      return { errorCode: error.code };

    }

    if (error instanceof TransportNotFoundError) {

      return { errorCode: TRANSPORT_ERROR_CODES.notFound };

    }

    if (error instanceof FinanceExpenseValidationError) {

      return { errorCode: TRANSPORT_ERROR_CODES.saveFailed };

    }

    if (error instanceof FrankfurterRequestError) {

      return { errorCode: TRANSPORT_ERROR_CODES.saveFailed };

    }

    return { errorCode: TRANSPORT_ERROR_CODES.saveFailed };

  }

}



export async function deleteTransportAction(

  _prev: TransportActionState,

  formData: FormData,

): Promise<TransportActionState> {

  const parsed = deleteTransportSchema.safeParse({

    tripId: formData.get("tripId"),

    transportId: formData.get("transportId"),

  });



  if (!parsed.success) {

    return { errorCode: TRANSPORT_ERROR_CODES.deleteFailed };

  }



  try {

    const trip = await requireTripOwner(parsed.data.tripId);

    const existing = await getTransportForTrip(trip.id, parsed.data.transportId);

    await deleteTransport(trip.id, parsed.data.transportId);

    revalidateTransportPaths(

      trip.id,

      parsed.data.transportId,

      existing ? [existing.departure.date] : [],

    );

    revalidateFinancePaths(trip.id);

    return { ok: true, successCode: TRANSPORT_SUCCESS_CODES.deleted };

  } catch (error) {

    if (error instanceof TransportNotFoundError) {

      return { errorCode: TRANSPORT_ERROR_CODES.notFound };

    }

    return { errorCode: TRANSPORT_ERROR_CODES.deleteFailed };

  }

}

