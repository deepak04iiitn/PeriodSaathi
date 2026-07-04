import CycleLog from '../models/CycleLog.js';
import User from '../models/User.js';
import parseDate from '../services/dateParser.js';
import * as pred from '../services/predictionService.js';
import * as msg from '../utils/messages.js';
import {
  CB,
  logTypeKeyboard,
  confirmDateKeyboard,
  mainMenuKeyboard,
} from '../utils/keyboard.js';
import { format, isFuture, daysBetween } from '../utils/dateHelpers.js';

const OPTS = { parse_mode: 'HTML' };

// ─────────────────────────────────────────────────────────────────────────────
// handleLogPeriod — entry points:
//
//   null                        → show start/end type-choice keyboard
//   callback LOG_PERIOD_START   → set AWAITING_LOG_PERIOD_DATE,     ask for start date
//   callback LOG_PERIOD_END     → set AWAITING_LOG_PERIOD_END_DATE, ask for end date
//   text (AWAITING_LOG_PERIOD_DATE)        → parse start date → confirm
//   text (AWAITING_LOG_PERIOD_END_DATE)    → parse end date   → confirm
//   callback CONFIRM_DATE_YES/NO           → save or re-ask
//
// Onboarding path (AWAITING_FIRST_PERIOD_DATE) bypasses the type choice
// and uses the same text-parsing + confirmation loop, branching in saveStartLog.
// ─────────────────────────────────────────────────────────────────────────────

export const handleLogPeriod = async (bot, chatId, user, input) => {
  // ── Entry: button press from main menu ────────────────────────────────────
  if (input === null || input === undefined) {
    user.pendingAction = null;
    user.pendingDate   = null;
    await user.save();
    await bot.sendMessage(chatId, msg.askLogType(), { ...OPTS, ...logTypeKeyboard() });
    return;
  }

  // ── Callback query ────────────────────────────────────────────────────────
  if (typeof input === 'object' && input.data) {
    return handleCallback(bot, chatId, user, input);
  }

  // ── Raw text — parse a date ───────────────────────────────────────────────
  return handleDateText(bot, chatId, user, input);
};

// ─────────────────────────────────────────────────────────────────────────────
// Route inline keyboard callbacks.
// ─────────────────────────────────────────────────────────────────────────────
const handleCallback = async (bot, chatId, user, query) => {
  const data = query.data;

  // ── Type choice ───────────────────────────────────────────────────────────
  if (data === CB.LOG_PERIOD_START) {
    user.pendingAction = 'AWAITING_LOG_PERIOD_DATE';
    user.pendingDate   = null;
    await user.save();
    await bot.sendMessage(chatId, msg.askPeriodDate(), OPTS);
    return;
  }

  if (data === CB.LOG_PERIOD_END) {
    user.pendingAction = 'AWAITING_LOG_PERIOD_END_DATE';
    user.pendingDate   = null;
    await user.save();
    await bot.sendMessage(chatId, msg.askPeriodEndDate(), OPTS);
    return;
  }

  // ── Date confirmation — re-ask ────────────────────────────────────────────
  if (data === CB.CONFIRM_DATE_NO) {
    user.pendingDate = null;
    await user.save();

    const isEnd = user.pendingAction === 'AWAITING_LOG_PERIOD_END_DATE';
    await bot.sendMessage(
      chatId,
      isEnd ? msg.askPeriodEndDate() : msg.askPeriodDate(),
      OPTS
    );
    return;
  }

  // ── Date confirmation — save ──────────────────────────────────────────────
  if (data === CB.CONFIRM_DATE_YES) {
    if (user.pendingAction === 'AWAITING_LOG_PERIOD_END_DATE') {
      return saveEndDate(bot, chatId, user);
    }
    return saveStartLog(bot, chatId, user);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Parse free-text date and ask for confirmation.
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

  user.pendingDate = parsed;
  await user.save();

  const isEnd = user.pendingAction === 'AWAITING_LOG_PERIOD_END_DATE';
  await bot.sendMessage(
    chatId,
    msg.confirmDate(parsed, isEnd ? 'end' : 'start'),
    { ...OPTS, ...confirmDateKeyboard() }
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Persist a new CycleLog (period start date).
// ─────────────────────────────────────────────────────────────────────────────
const saveStartLog = async (bot, chatId, user) => {
  const startDate = user.pendingDate;

  if (!startDate) {
    // pendingDate lost (e.g. server restart between messages) — re-ask.
    user.pendingAction = user.onboardingComplete
      ? 'AWAITING_LOG_PERIOD_DATE'
      : 'AWAITING_FIRST_PERIOD_DATE';
    await user.save();
    await bot.sendMessage(chatId, msg.askPeriodDate(), OPTS);
    return;
  }

  // ── Duplicate guard ───────────────────────────────────────────────────────
  if (user.onboardingComplete) {
    const windowStart = new Date(startDate);
    const windowEnd   = new Date(startDate);
    windowStart.setDate(windowStart.getDate() - 2);
    windowEnd.setDate(windowEnd.getDate()   + 2);

    const existing = await CycleLog.findOne({
      telegramId:      user.telegramId,
      periodStartDate: { $gte: windowStart, $lte: windowEnd },
    }).lean();

    if (existing) {
      await bot.sendMessage(chatId, msg.duplicateLogWarning(existing.periodStartDate), OPTS);
      user.pendingAction = null;
      user.pendingDate   = null;
      await user.save();
      await bot.sendMessage(
        chatId,
        `Returning to menu. Tap <b>📅 Log Period</b> if you want to try again.`,
        { ...OPTS, ...mainMenuKeyboard() }
      );
      return;
    }
  }

  // ── Create CycleLog ───────────────────────────────────────────────────────
  const prevLog = await CycleLog.findOne({ telegramId: user.telegramId })
    .sort({ periodStartDate: -1 })
    .lean();

  const cycleLength = prevLog
    ? daysBetween(prevLog.periodStartDate, startDate)
    : null;

  await CycleLog.create({ telegramId: user.telegramId, periodStartDate: startDate, cycleLength });

  console.log(
    `[LOG_PERIOD] Start saved for telegramId=${user.telegramId}, ` +
    `startDate=${format(startDate)}, cycleLength=${cycleLength}`
  );

  user.pendingDate = null;

  // ── Onboarding path ───────────────────────────────────────────────────────
  if (!user.onboardingComplete) {
    user.pendingAction = 'AWAITING_ONBOARDING_CYCLE_LENGTH';
    await user.save();
    await bot.sendMessage(chatId, msg.askCycleLength(), OPTS);
    return;
  }

  // ── Normal path ───────────────────────────────────────────────────────────
  user.pendingAction = null;
  await user.save();

  await pred.recalculateAverages(user);

  const freshUser  = await User.findOne({ telegramId: user.telegramId }).lean();
  const latestLog  = await CycleLog.findOne({ telegramId: user.telegramId })
    .sort({ periodStartDate: -1 }).lean();
  const nextDate   = pred.getNextPeriodDate(freshUser, latestLog);

  await bot.sendMessage(chatId, msg.logSuccess(startDate, nextDate), { ...OPTS, ...mainMenuKeyboard() });
};

// ─────────────────────────────────────────────────────────────────────────────
// Update the most recent CycleLog with a period end date.
// ─────────────────────────────────────────────────────────────────────────────
const saveEndDate = async (bot, chatId, user) => {
  const endDate = user.pendingDate;

  if (!endDate) {
    user.pendingAction = 'AWAITING_LOG_PERIOD_END_DATE';
    await user.save();
    await bot.sendMessage(chatId, msg.askPeriodEndDate(), OPTS);
    return;
  }

  // Find the most recent log that has no end date yet.
  const openLog = await CycleLog.findOne({
    telegramId:    user.telegramId,
    periodEndDate: { $exists: false },
  }).sort({ periodStartDate: -1 });

  if (!openLog) {
    user.pendingAction = null;
    user.pendingDate   = null;
    await user.save();
    await bot.sendMessage(chatId, msg.noOpenLog(), { ...OPTS, ...mainMenuKeyboard() });
    return;
  }

  // End date must be after start date.
  if (new Date(endDate) <= new Date(openLog.periodStartDate)) {
    user.pendingDate = null;
    await user.save();
    await bot.sendMessage(chatId, msg.endBeforeStart(openLog.periodStartDate), OPTS);
    // Re-ask for the end date.
    user.pendingAction = 'AWAITING_LOG_PERIOD_END_DATE';
    await user.save();
    await bot.sendMessage(chatId, msg.askPeriodEndDate(), OPTS);
    return;
  }

  openLog.periodEndDate = endDate;
  await openLog.save();

  const periodDays = daysBetween(openLog.periodStartDate, endDate);

  console.log(
    `[LOG_PERIOD] End saved for telegramId=${user.telegramId}, ` +
    `endDate=${format(endDate)}, periodDays=${periodDays}`
  );

  user.pendingAction = null;
  user.pendingDate   = null;
  await user.save();

  await pred.recalculateAverages(user);

  await bot.sendMessage(chatId, msg.logEndSuccess(endDate, periodDays), { ...OPTS, ...mainMenuKeyboard() });
};

// ─────────────────────────────────────────────────────────────────────────────
// deleteLog — removes a CycleLog entry and triggers average recalculation.
// Called by handleHistory.
// ─────────────────────────────────────────────────────────────────────────────
export const deleteLog = async (logId, user) => {
  const log = await CycleLog.findOne({ _id: logId, telegramId: user.telegramId });
  if (!log) return false;

  await log.deleteOne();
  console.log(`[LOG_PERIOD] Deleted CycleLog ${logId} for telegramId=${user.telegramId}`);
  await pred.recalculateAverages(user);
  return true;
};
