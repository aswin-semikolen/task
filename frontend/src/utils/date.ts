const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const PLACEHOLDER = '-';

const toDisplay = (day: number, monthIndex: number, year: number) =>
  `${String(day).padStart(2, '0')} ${MONTHS[monthIndex]} ${year}`;

/**
 * Formats a date-only value (`YYYY-MM-DD`) as `DD MMM YYYY`.
 *
 * The parts are read off the string rather than through `new Date`, because a
 * bare date string parses as UTC midnight — in any timezone behind UTC that
 * renders as the previous day, which would show the wrong date of birth.
 */
export function formatDateOnly(value?: string | null): string {
  if (!value) return PLACEHOLDER;

  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day || month < 1 || month > 12) return PLACEHOLDER;

  return toDisplay(day, month - 1, year);
}

/** Formats a full timestamp as `DD MMM YYYY` in the viewer's local timezone. */
export function formatTimestamp(value?: string | null): string {
  if (!value) return PLACEHOLDER;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return PLACEHOLDER;

  return toDisplay(date.getDate(), date.getMonth(), date.getFullYear());
}
