import CycleLog from '../models/CycleLog.js';
import User from '../models/User.js';
import parseDate from '../services/dateParser.js';
import * as pred from '../services/predictionService.js';
import * as msg from '../utils/messages.js';
import {
  confirmDateKeyboard,
  mainMenuKeyboard,
  CB,
} from '../utils/keyboard.js';
import { format, isFuture, daysBetween } from '../utils/dateHelpers.js';

const OPTS = { parse_mode: 'Markdown' };

// ─────────────────────────────────────────────────────────────────────────────
// handleLogPeriod — entry points:
//
//   1. Text string (raw date input while pendingAction is set)
//   2. callback_query object  — CONFIRM_DATE_YES / CONFIRM_DATE_NO
//   3. null                   — user pressed the "📅 Log Period" reply button
//
// State flow:
//   null / button press
//     → set AWAITING_LOG_PERIOD_DATE (or AWAITING_FIRST_PERIOD_DATE for new users)
//     → ask for date
//
//   AWAITING_FIRST_PERIOD_DATE | AWAITING_LOG_PERIOD_DATE  (text)
//     → parse date → store in user.pendingDate
//     → show confirmDateKeyboard
//
//   CONFIRM_DATE_YES  (callback)
//     → save CycleLog
//     → onboarding:  set AWAITING_ONBOARDING_CYCLE_LENGTH, ask cycle length
//     → normal:      recalculate averages, show success + main menu
//
//   CONFIRM_DATE_NO  (callback)
//     → re-ask for date (keep existing pendingAction)
// ─────────────────────────────────────────────────────────────────────────────

export const handleLogPeriod = async (bot, chatId, user, input) => {
  // ── Entry: button press with no pending state ─────────────────────────────
  if (input === null || input === undefined) {
    user.pendingAction = 'AWAITING_LOG_PERIOD_DATE';
    user.pendingDate   = null;
    await user.save();
    await bot.sendMessage(chatId, msg.askPeriodDate(), OPTS);
    return;
  }

  // ── Callback query ────────────────────────────────────────────────────────
  if (typeof input === 'object' && input.data) {
    return handleCallback(bot, chatId, user, input);
  }

  // ── Raw text — parse the date ─────────────────────────────────────────────
  return handleDateText(bot, chatId, user, input);
};

// ─────────────────────────────────────────────────────────────────────────────
// Parse free-text date input and ask for confirmation.
// ─────────────────────────────────────────────────────────────────────────────
const handleDateText = async (bot, chatId, user, text) => {
  const parsed = parseDate(text);

  if (!parsed) {
    await bot.sendMessage(chatId, msg.dateParseError(), OPTS);
    return;
  }

  if (isFuture(parsed)) {
    await bot.sendMessage(chatId, msg.dateTooFarFuture(), OPTS);
    return;
  }

  // Store the parsed date on the user doc so it survives the callback round-trip.
  user.pendingDate = parsed;
  await user.save();

  await bot.sendMessage(
    chatId,
    msg.confirmDate(parsed),
    { ...OPTS, ...confirmDateKeyboard() }
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Handle inline keyboard callbacks (YES / NO on date confirmation).
// ─────────────────────────────────────────────────────────────────────────────
const handleCallback = async (bot, chatId, user, query) => {
  const data = query.data;

  if (data === CB.CONFIRM_DATE_NO) {
    // User wants to re-enter — keep the same pendingAction, re-ask.
    user.pendingDate = null;
    await user.save();
    await bot.sendMessage(chatId, msg.askPeriodDate(), OPTS);
    return;
  }

  if (data === CB.CONFIRM_DATE_YES) {
    return saveLog(bot, chatId, user);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Persist the confirmed CycleLog and branch on onboarding vs normal flow.
// ─────────────────────────────────────────────────────────────────────────────
const saveLog = async (bot, chatId, user) => {
  const startDate = user.pendingDate;

  if (!startDate) {
    // Edge case: pendingDate was lost (e.g., server restart between messages).
    user.pendingAction = user.onboardingComplete
      ? 'AWAITING_LOG_PERIOD_DATE'
      : 'AWAITING_FIRST_PERIOD_DATE';
    user.pendingDate = null;
    await user.save();
    await bot.sendMessage(chatId, msg.askPeriodDate(), OPTS);
    return;
  }

  // ── Duplicate guard: warn if a log within ±2 days already exists ──────────
  if (user.onboardingComplete) {
    const windowStart = new Date(startDate);
    const windowEnd   = new Date(startDate);
    windowStart.setDate(windowStart.getDate() - 2);
    windowEnd.setDate(windowEnd.getDate() + 2);

    const existing = await CycleLog.findOne({
      telegramId:      user.telegramId,
      periodStartDate: { $gte: windowStart, $lte: windowEnd },
    }).lean();

    if (existing) {
      await bot.sendMessage(
        chatId,
        msg.duplicateLogWarning(existing.periodStartDate),
        OPTS
      );
      // Clear pending state so user returns to menu — don't save duplicate.
      user.pendingAction = null;
      user.pendingDate   = null;
      await user.save();
      await bot.sendMessage(
        chatId,
        'Returning to menu. Tap *📅 Log Period* if you want to try again.',
        { ...OPTS, ...mainMenuKeyboard() }
      );
      return;
    }
  }

  // ── Create the CycleLog ───────────────────────────────────────────────────
  const prevLog = await CycleLog.findOne({ telegramId: user.telegramId })
    .sort({ periodStartDate: -1 })
    .lean();

  const cycleLength = prevLog
    ? daysBetween(prevLog.periodStartDate, startDate)
    : null;

  await CycleLog.create({
    telegramId:      user.telegramId,
    periodStartDate: startDate,
    cycleLength,
  });

  console.log(
    `[LOG_PERIOD] Saved CycleLog for telegramId=${user.telegramId}, ` +
    `startDate=${format(startDate)}, cycleLength=${cycleLength}`
  );

  // ── Clear pending state ───────────────────────────────────────────────────
  user.pendingDate = null;

  // ── Branch: onboarding vs normal ─────────────────────────────────────────
  if (!user.onboardingComplete) {
    // Onboarding path — now ask for cycle length.
    user.pendingAction = 'AWAITING_ONBOARDING_CYCLE_LENGTH';
    await user.save();
    await bot.sendMessage(chatId, msg.askCycleLength(), OPTS);
    return;
  }

  // Normal path — recalculate averages and show success.
  user.pendingAction = null;
  await user.save();

  await pred.recalculateAverages(user);

  // Re-fetch user to get the freshly recalculated avgCycleLength.
  const freshUser = await User.findOne({ telegramId: user.telegramId }).lean();

  const latestLog = await CycleLog.findOne({ telegramId: user.telegramId })
    .sort({ periodStartDate: -1 })
    .lean();

  const nextDate = pred.getNextPeriodDate(freshUser, latestLog);

  await bot.sendMessage(
    chatId,
    msg.logSuccess(startDate, nextDate),
    { ...OPTS, ...mainMenuKeyboard() }
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// deleteLog — removes a single CycleLog entry owned by the given telegramId
// and triggers average recalculation. Called by handleHistory in Phase 7.
//
// Returns true on success, false if the log was not found or not owned by user.
// ─────────────────────────────────────────────────────────────────────────────
export const deleteLog = async (logId, user) => {
  const log = await CycleLog.findOne({
    _id:        logId,
    telegramId: user.telegramId,
  });

  if (!log) return false;

  await log.deleteOne();

  console.log(
    `[LOG_PERIOD] Deleted CycleLog ${logId} for telegramId=${user.telegramId}`
  );

  // Recalculate averages with the entry removed.
  await pred.recalculateAverages(user);

  return true;
};
