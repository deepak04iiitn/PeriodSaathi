import CycleLog from '../models/CycleLog.js';
import { addDays, daysBetween } from '../utils/dateHelpers.js';

// ─────────────────────────────────────────────────────────────────────────────
// Minimum number of completed cycles (gaps between consecutive start dates)
// before we switch from the default 28-day assumption to a personal average.
// ─────────────────────────────────────────────────────────────────────────────
const MIN_CYCLES_FOR_AVERAGE = 2;

// Number of recent cycles used in the rolling average.
const ROLLING_WINDOW = 6;

// ─────────────────────────────────────────────────────────────────────────────
// getNextPeriodDate
// Returns the predicted next period start date.
// ─────────────────────────────────────────────────────────────────────────────
export const getNextPeriodDate = (user, lastLog) => {
  if (!lastLog) return addDays(new Date(), user.avgCycleLength);
  return addDays(lastLog.periodStartDate, user.avgCycleLength);
};

// ─────────────────────────────────────────────────────────────────────────────
// getCurrentCycleDay
// "Day 1" is the period start date itself.
// ─────────────────────────────────────────────────────────────────────────────
export const getCurrentCycleDay = (lastLog) => {
  if (!lastLog) return null;
  return daysBetween(lastLog.periodStartDate, new Date()) + 1;
};

// ─────────────────────────────────────────────────────────────────────────────
// recalculateAverages
// Fetches the last ROLLING_WINDOW logs, computes cycle lengths between
// consecutive start dates, and updates user.avgCycleLength (and
// user.avgPeriodLength if end dates are available).
//
// Mutates + saves the user document. Safe to call after every new CycleLog.
// ─────────────────────────────────────────────────────────────────────────────
export const recalculateAverages = async (user) => {
  const logs = await CycleLog.find({ telegramId: user.telegramId })
    .sort({ periodStartDate: -1 })
    .limit(ROLLING_WINDOW + 1) // +1 so we can compute gaps between ROLLING_WINDOW entries
    .lean();

  // Need at least 2 logs to compute a gap.
  if (logs.length < MIN_CYCLES_FOR_AVERAGE) return;

  // Logs come back newest-first; reverse to chronological for gap calculation.
  const sorted = [...logs].reverse();

  const cycleLengths = [];
  for (let i = 1; i < sorted.length; i++) {
    const gap = daysBetween(sorted[i - 1].periodStartDate, sorted[i].periodStartDate);
    if (gap > 0 && gap <= 90) {
      // Ignore gaps that are clearly data-entry errors (> 90 days between consecutive logs).
      cycleLengths.push(gap);
    }
  }

  if (cycleLengths.length >= MIN_CYCLES_FOR_AVERAGE) {
    const avg = Math.round(
      cycleLengths.reduce((sum, n) => sum + n, 0) / cycleLengths.length
    );
    user.avgCycleLength = avg;
  }

  // Recalculate avgPeriodLength from logs that have both start and end dates.
  const periodLengths = logs
    .filter((l) => l.periodEndDate)
    .map((l) => daysBetween(l.periodStartDate, l.periodEndDate))
    .filter((d) => d > 0 && d <= 14);

  if (periodLengths.length >= MIN_CYCLES_FOR_AVERAGE) {
    user.avgPeriodLength = Math.round(
      periodLengths.reduce((sum, n) => sum + n, 0) / periodLengths.length
    );
  }

  await user.save();

  console.log(
    `[PREDICTION] Averages recalculated for telegramId=${user.telegramId}: ` +
    `avgCycleLength=${user.avgCycleLength}, avgPeriodLength=${user.avgPeriodLength}`
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// getFertileWindow — stub, enabled in Phase 14.
// ─────────────────────────────────────────────────────────────────────────────
export const getFertileWindow = (_nextPeriodDate, _avgCycleLength) => null;
