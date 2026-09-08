export function formatDayActivityCount(count: number): string {
  if (count === 0) {
    return "אין פעילויות";
  }
  if (count === 1) {
    return "פעילות אחת";
  }
  return `${count} פעילויות`;
}
