"use server";



import { revalidatePath } from "next/cache";

import { revalidateItineraryPaths } from "@/features/itinerary/revalidation";

import { revalidateTripManagement } from "@/features/trip-management/revalidation";

import { requireTripOwner } from "@/features/trips/authorization";

import { parseSimpleEntityCostFromFormData } from "@/features/finance/entity-cost-schema";

import {

  FinanceExpenseValidationError,

  FrankfurterRequestError,

} from "@/features/finance/finance-expense-domain";

import { revalidateFinancePaths } from "@/features/finance/revalidation";

import {

  ACCOMMODATION_ERROR_CODES,

  ACCOMMODATION_SUCCESS_CODES,

  type AccommodationErrorCode,

  type AccommodationSuccessCode,

} from "./constants";

import {

  AccommodationNotFoundError,

  AccommodationValidationError,

  createAccommodation,

  deleteAccommodation,

  updateAccommodation,

} from "./accommodation-domain";

import {

  accommodationMutationSchema,

  createAccommodationSchema,

  parseAccommodationFieldsFromFormData,

  updateAccommodationSchema,

} from "./schemas";



export type AccommodationActionState = {

  ok?: boolean;

  errorCode?: AccommodationErrorCode;

  successCode?: AccommodationSuccessCode;

  fieldErrors?: Record<string, string>;

};



function revalidateAccommodationPaths(tripId: string): void {

  revalidatePath(`/app/trips/${tripId}/accommodations`);

  revalidateTripManagement(tripId, "accommodations");

  revalidateItineraryPaths(tripId);

  revalidatePath(`/app/trips/${tripId}/more`);

}



export async function createAccommodationAction(

  _prev: AccommodationActionState,

  formData: FormData,

): Promise<AccommodationActionState> {

  const parsed = createAccommodationSchema.safeParse(

    parseAccommodationFieldsFromFormData(formData),

  );



  if (!parsed.success) {

    return {

      errorCode: ACCOMMODATION_ERROR_CODES.generic,

      fieldErrors: Object.fromEntries(

        parsed.error.issues.map((issue) => [issue.path.join("."), issue.message]),

      ),

    };

  }



  const costParsed = parseSimpleEntityCostFromFormData(formData);

  if (!costParsed.ok) {

    return {
      errorCode: ACCOMMODATION_ERROR_CODES.invalidCostData,
      fieldErrors: { costAmount: costParsed.errorCode },
    };

  }



  try {

    const trip = await requireTripOwner(parsed.data.tripId);

    await createAccommodation({

      tripId: trip.id,

      startDate: trip.startDate,

      endDate: trip.endDate,

      fields: parsed.data,

      cost: costParsed.value.hasCost ? costParsed.value : null,

    });

    revalidateAccommodationPaths(trip.id);

    revalidateFinancePaths(trip.id);

    return { ok: true, successCode: ACCOMMODATION_SUCCESS_CODES.created };

  } catch (error) {

    if (error instanceof AccommodationValidationError) {

      return { errorCode: error.code };

    }

    if (error instanceof FinanceExpenseValidationError) {

      return { errorCode: ACCOMMODATION_ERROR_CODES.generic };

    }

    if (error instanceof FrankfurterRequestError) {

      return { errorCode: ACCOMMODATION_ERROR_CODES.generic };

    }

    return { errorCode: ACCOMMODATION_ERROR_CODES.generic };

  }

}



export async function updateAccommodationAction(

  _prev: AccommodationActionState,

  formData: FormData,

): Promise<AccommodationActionState> {

  const parsed = updateAccommodationSchema.safeParse({

    ...parseAccommodationFieldsFromFormData(formData),

    accommodationId: formData.get("accommodationId"),

  });



  if (!parsed.success) {

    return {

      errorCode: ACCOMMODATION_ERROR_CODES.generic,

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

      errorCode: ACCOMMODATION_ERROR_CODES.invalidCostData,

      fieldErrors: { costAmount: costSync.errorCode },

    };

  }



  try {

    const trip = await requireTripOwner(parsed.data.tripId);

    await updateAccommodation({

      tripId: trip.id,

      accommodationId: parsed.data.accommodationId,

      startDate: trip.startDate,

      endDate: trip.endDate,

      fields: parsed.data,

      costSync: costSync

        ? costSync.value.hasCost

          ? costSync.value

          : null

        : undefined,

    });

    revalidateAccommodationPaths(trip.id);

    revalidatePath(

      `/app/trips/${trip.id}/accommodations/${parsed.data.accommodationId}`,

    );

    if (costSync) {

      revalidateFinancePaths(trip.id);

    }

    return { ok: true, successCode: ACCOMMODATION_SUCCESS_CODES.updated };

  } catch (error) {

    if (error instanceof AccommodationValidationError) {

      return { errorCode: error.code };

    }

    if (error instanceof AccommodationNotFoundError) {

      return { errorCode: ACCOMMODATION_ERROR_CODES.notFound };

    }

    if (error instanceof FinanceExpenseValidationError) {

      return { errorCode: ACCOMMODATION_ERROR_CODES.generic };

    }

    if (error instanceof FrankfurterRequestError) {

      return { errorCode: ACCOMMODATION_ERROR_CODES.generic };

    }

    return { errorCode: ACCOMMODATION_ERROR_CODES.generic };

  }

}



export async function deleteAccommodationAction(

  _prev: AccommodationActionState,

  formData: FormData,

): Promise<AccommodationActionState> {

  const parsed = accommodationMutationSchema.safeParse({

    tripId: formData.get("tripId"),

    accommodationId: formData.get("accommodationId"),

  });



  if (!parsed.success) {

    return { errorCode: ACCOMMODATION_ERROR_CODES.generic };

  }



  try {

    await requireTripOwner(parsed.data.tripId);

    await deleteAccommodation({

      tripId: parsed.data.tripId,

      accommodationId: parsed.data.accommodationId,

    });

    revalidateAccommodationPaths(parsed.data.tripId);

    revalidateFinancePaths(parsed.data.tripId);

    revalidatePath(

      `/app/trips/${parsed.data.tripId}/accommodations/${parsed.data.accommodationId}`,

    );

    return { ok: true, successCode: ACCOMMODATION_SUCCESS_CODES.deleted };

  } catch (error) {

    if (error instanceof AccommodationNotFoundError) {

      return { errorCode: ACCOMMODATION_ERROR_CODES.notFound };

    }

    return { errorCode: ACCOMMODATION_ERROR_CODES.generic };

  }

}

