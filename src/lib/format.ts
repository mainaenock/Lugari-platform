export function formatDate(value?: string) {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat('en-KE', {
    ...(value.length >= 10 ? { day: 'numeric' as const } : {}),
    ...(value.length >= 7 ? { month: 'long' as const } : {}), year: 'numeric', timeZone: 'Africa/Nairobi',
  }).format(date);
}
export function money(value: number) {
  return 'KSh ' + new Intl.NumberFormat('en-KE').format(value);
}
export const matches = (value: string, query: string) =>
  query.toLocaleLowerCase().trim().split(/\s+/).every(term => value.toLocaleLowerCase().includes(term));
