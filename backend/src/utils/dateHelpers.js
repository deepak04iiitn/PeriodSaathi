// ─────────────────────────────────────────────────────────────────────────────
// Shared date utilities used across services and message builders.
// ─────────────────────────────────────────────────────────────────────────────

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Format a Date as "3 Jul 2026".
 */
export const format = (date) => {
  const d = new Date(date);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

/**
 * Return the number of whole calendar days between two dates.
 * Positive when b is after a, negative when b is before a.
 */
export const daysBetween = (a, b) => {
  const msPerDay = 86_400_000;
  const startOfA = new Date(a).setHours(0, 0, 0, 0);
  const startOfB = new Date(b).setHours(0, 0, 0, 0);
  return Math.round((startOfB - startOfA) / msPerDay);
};

/**
 * Add N calendar days to a date and return the resulting Date.
 */
export const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

/**
 * Return today's date with time zeroed out.
 */
export const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Return true if the given date is strictly in the future (after today).
 */
export const isFuture = (date) => daysBetween(today(), date) > 0;
