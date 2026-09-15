"use server";

import { TRIP_ERROR_CODES } from "@/features/trips/constants";
import {
  applyTripDateChangeSchema,
  previewTripDateChangeSchema,
} from "@/features/trips/schemas";
import { applyTripDateChange } from "./apply-trip-date-change";
import { TRIP_DATE_CHANGE_ERROR_CODES } from "./constants";
import {
  TripDateChangeInvalidPreviewTokenError,
  TripDateChangeNoChangeError,
  TripDateChangeStalePreviewError,
} from "./errors";
import { previewTripDateChange } from "./preview-trip-date-change";
import type { TripDateChangePreviewResult } from "./trip-date-change-types";

export type TripDateChangeActionState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: {
    startDate?: string;
    endDate?: string;
  };
  preview?: TripDateChangePreviewResult;
};

function mapDateFieldErrors(error: {
  issues: readonly { path: readonly PropertyKey[]; message: string }[];
}): TripDateChangeActionState["fieldErrors"] {
  const fieldErrors: TripDateChangeActionState["fieldErrors"] = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (key === "startDate") {
      fieldErrors.startDate = TRIP_ERROR_CODES.startDate;
    } else if (key === "endDate") {
      fieldErrors.endDate = issue.message.includes("before or equal")
        ? TRIP_ERROR_CODES.dateOrder
        : issue.message.includes("maximum")
          ? TRIP_ERROR_CODES.maxDuration
          : TRIP_ERROR_CODES.endDate;
    }
  }
  return fieldErrors;
}

export async function previewTripDateChangeAction(
  _prev: TripDateChangeActionState,
  formData: FormData,
): Promise<TripDateChangeActionState> {
  const parsed = previewTripDateChangeSchema.safeParse({
    tripId: formData.get("tripId"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  });

  if (!parsed.success) {
    return { fieldErrors: mapDateFieldErrors(parsed.error) };
  }

  try {
    const preview = await previewTripDateChange(parsed.data);
    return { ok: true, preview };
  } catch (error) {
    if (error instanceof TripDateChangeNoChangeError) {
      return { error: TRIP_DATE_CHANGE_ERROR_CODES.noChange };
    }
    return { error: TRIP_ERROR_CODES.generic };
  }
}

export async function applyTripDateChangeAction(
  _prev: TripDateChangeActionState,
  formData: FormData,
): Promise<TripDateChangeActionState> {
  const parsed = applyTripDateChangeSchema.safeParse({
    tripId: formData.get("tripId"),
    previewToken: formData.get("previewToken"),
  });

  if (!parsed.success) {
    return { error: TRIP_DATE_CHANGE_ERROR_CODES.validationFailed };
  }

  try {
    await applyTripDateChange(parsed.data);
    return { ok: true };
  } catch (error) {
    if (error instanceof TripDateChangeStalePreviewError) {
      return { error: TRIP_DATE_CHANGE_ERROR_CODES.stalePreview };
    }
    if (error instanceof TripDateChangeInvalidPreviewTokenError) {
      return { error: TRIP_DATE_CHANGE_ERROR_CODES.invalidPreviewToken };
    }
    return { error: TRIP_ERROR_CODES.generic };
  }
}
