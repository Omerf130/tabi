export function shouldApplyAutocompleteResponse(
  responseRequestId: number,
  latestRequestId: number,
): boolean {
  return responseRequestId === latestRequestId;
}
