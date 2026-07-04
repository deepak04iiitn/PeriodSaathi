import * as chrono from 'chrono-node';
import { today, isFuture, daysBetween } from '../utils/dateHelpers.js';

// ─────────────────────────────────────────────────────────────────────────────
// Custom chrono parser that handles "dd/mm" and "dd/mm/yyyy" in day-first
// order, since the target audience (India) uses dd/mm convention.
// chrono-node defaults to mm/dd (US), so we override ambiguous numeric inputs.
// ─────────────────────────────────────────────────────────────────────────────
const dayFirstParser = {
  pattern: () => /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/,
  extract: (_context, match) => {
    const day   = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // 0-indexed
    const yearRaw = match[3];
    const year = yearRaw
      ? yearRaw.length === 2 ? 2000 + parseInt(yearRaw, 10) : parseInt(yearRaw, 10)
      : new Date().getFullYear();

    if (day < 1 || day > 31 || month < 0 || month > 11) return null;
    return { day, month, year };
  },
};

const customChrono = chrono.casual.clone();
customChrono.parsers.unshift(dayFirstParser);

/**
 * Parse a natural-language date string supplied by a Telegram user.
 *
 * Accepts:
 *   "today", "yesterday", "3 July", "July 3", "3 Jul 2026",
 *   "03/07", "03/07/2026", "last Monday", "2 days ago", "the 5th"
 *
 * Returns a Date with time zeroed to midnight, or null if unparseable.
 *
 * Post-processing rules:
 *   - Future dates (after today) → return null (periods can't be future-logged).
 *   - If parsed month/day combination gives a future date this year →
 *     try the same date last year. Example: user types "3 July" in January
 *     when they mean July of last year.
 */
const parseDate = (text) => {
  if (!text || typeof text !== 'string') return null;

  const now = new Date();
  const results = customChrono.parse(text.trim(), now, { forwardDate: false });

  if (!results.length) return null;

  let date = results[0].date();
  date.setHours(0, 0, 0, 0);

  // If the parsed date is in the future by more than 1 day, try subtracting a year.
  if (isFuture(date) && daysBetween(today(), date) > 1) {
    date = new Date(date);
    date.setFullYear(date.getFullYear() - 1);
    date.setHours(0, 0, 0, 0);
  }

  // After adjustment, still in the future → unparseable for our use case.
  if (isFuture(date)) return null;

  // Sanity guard: dates older than 2 years are likely a parse error.
  if (daysBetween(date, today()) > 730) return null;

  return date;
};

export default parseDate;
