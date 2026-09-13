type AccommodationLocationInput = {
  city?: string;
  addressEnglish?: string;
  addressJapanese?: string;
};

export function buildAccommodationLocationLabel(
  accommodation: AccommodationLocationInput,
): string | undefined {
  const city = accommodation.city?.trim();
  if (city) {
    return city;
  }

  const addressEnglish = accommodation.addressEnglish?.trim();
  if (addressEnglish) {
    return addressEnglish;
  }

  const addressJapanese = accommodation.addressJapanese?.trim();
  return addressJapanese || undefined;
}
