import { NextResponse } from "next/server";
import { getCurrentUser } from "@/features/auth/session";
import { requireTripMember } from "@/features/trips/authorization";
import { resolveRequestLocale } from "@/features/i18n/resolve-request-locale";
import { checkCustomTranslationRateLimit } from "@/features/language/translation/custom-translation-rate-limit";
import {
  CustomTranslationUnavailableError,
  CustomTranslationValidationError,
  translateCustomPhrase,
} from "@/features/language/translation/translate-custom-phrase.server";
import { customPhraseTranslationRequestSchema } from "@/features/language/custom-phrase-translation-schema";

const CUSTOM_TRANSLATION_ERRORS = {
  unauthorized: "unauthorized",
  forbidden: "forbidden",
  invalidInput: "invalid_input",
  rateLimited: "rate_limited",
  unavailable: "unavailable",
  unknownTarget: "unknown_target",
} as const;

export async function POST(
  request: Request,
  context: { params: Promise<{ tripId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: CUSTOM_TRANSLATION_ERRORS.unauthorized },
      { status: 401 },
    );
  }

  const { tripId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: CUSTOM_TRANSLATION_ERRORS.invalidInput },
      { status: 400 },
    );
  }

  const parsed = customPhraseTranslationRequestSchema.safeParse(body);
  if (!parsed.success || parsed.data.tripId !== tripId) {
    return NextResponse.json(
      { error: CUSTOM_TRANSLATION_ERRORS.invalidInput },
      { status: 400 },
    );
  }

  let trip;
  try {
    trip = await requireTripMember(tripId);
  } catch {
    return NextResponse.json(
      { error: CUSTOM_TRANSLATION_ERRORS.forbidden },
      { status: 403 },
    );
  }

  if (!trip.effectiveTravelLanguageCode) {
    return NextResponse.json(
      { error: CUSTOM_TRANSLATION_ERRORS.unknownTarget },
      { status: 422 },
    );
  }

  if (!checkCustomTranslationRateLimit(user.id)) {
    return NextResponse.json(
      { error: CUSTOM_TRANSLATION_ERRORS.rateLimited },
      { status: 429 },
    );
  }

  try {
    const uiLocale = await resolveRequestLocale();
    const result = await translateCustomPhrase({
      text: parsed.data.text,
      uiLocale,
      targetTravelLanguageCode: trip.effectiveTravelLanguageCode,
    });

    return NextResponse.json({
      translatedText: result.translatedText,
      transliterationLatin: result.transliterationLatin,
      targetLanguage: result.targetLanguage,
    });
  } catch (error) {
    if (error instanceof CustomTranslationValidationError) {
      return NextResponse.json(
        { error: CUSTOM_TRANSLATION_ERRORS.invalidInput },
        { status: 400 },
      );
    }
    if (error instanceof CustomTranslationUnavailableError) {
      return NextResponse.json(
        { error: CUSTOM_TRANSLATION_ERRORS.unavailable },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: CUSTOM_TRANSLATION_ERRORS.unavailable },
      { status: 503 },
    );
  }
}
