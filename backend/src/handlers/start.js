import * as msg from '../utils/messages.js';
import { mainMenuKeyboard } from '../utils/keyboard.js';
import { addDays, format } from '../utils/dateHelpers.js';

// ─────────────────────────────────────────────────────────────────────────────
// Onboarding state machine
//
// States managed here:
//   null                           → send welcome, set AWAITING_FIRST_PERIOD_DATE
//   AWAITING_ONBOARDING_CYCLE_LENGTH → accept number, complete onboarding
//
// The date-entry states (AWAITING_FIRST_PERIOD_DATE, CONFIRM_DATE_*)
// are handled by handleLogPeriod, which checks user.onboardingComplete to
// decide what to do after saving the first CycleLog.
// ─────────────────────────────────────────────────────────────────────────────

const OPTS = { parse_mode: 'HTML' };

/**
 * Entry point called by the router on /start, and also by the pending-action
 * dispatcher when pendingAction === 'AWAITING_ONBOARDING_CYCLE_LENGTH'.
 *
 * @param {TelegramBot} bot
 * @param {number}      chatId
 * @param {User}        user      - live Mongoose document
 * @param {string|null} input     - raw text input, null on fresh /start
 */
export const handleStart = async (bot, chatId, user, input = null) => {
  // ── Step A: returning user re-sends /start ────────────────────────────────
  if (user.onboardingComplete && !user.pendingAction) {
    await bot.sendMessage(
      chatId,
      msg.welcomeBack(user.firstName || 'there'),
      { ...OPTS, ...mainMenuKeyboard() }
    );
    return;
  }

  // ── Step B: cycle length answer during onboarding ─────────────────────────
  if (user.pendingAction === 'AWAITING_ONBOARDING_CYCLE_LENGTH' && input !== null) {
    return handleCycleLengthInput(bot, chatId, user, input);
  }

  // ── Step C: new user — send welcome and ask for last period date ──────────
  user.pendingAction = 'AWAITING_FIRST_PERIOD_DATE';
  await user.save();

  await bot.sendMessage(
    chatId,
    msg.welcome(user.firstName || 'there'),
    OPTS
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Internal: validate + save the cycle length supplied during onboarding.
// ─────────────────────────────────────────────────────────────────────────────
const handleCycleLengthInput = async (bot, chatId, user, input) => {
  const value = parseInt(input.trim(), 10);

  if (isNaN(value) || value < 15 || value > 60) {
    await bot.sendMessage(chatId, msg.invalidNumberInput(15, 60), OPTS);
    return;
  }

  user.avgCycleLength     = value;
  user.onboardingComplete = true;
  user.pendingAction      = null;
  await user.save();

  // Calculate next period prediction from the first logged CycleLog.
  // Import here to avoid circular dependencies at module load time.
  const { default: CycleLog } = await import('../models/CycleLog.js');

  const lastLog = await CycleLog.findOne({ telegramId: user.telegramId })
    .sort({ periodStartDate: -1 })
    .lean();

  const nextDate = lastLog
    ? addDays(lastLog.periodStartDate, value)
    : addDays(new Date(), value);

  await bot.sendMessage(
    chatId,
    msg.onboardingComplete(nextDate),
    { ...OPTS, ...mainMenuKeyboard() }
  );

  console.log(
    `[START] Onboarding complete for telegramId=${user.telegramId}, ` +
    `avgCycleLength=${value}, nextPredicted=${format(nextDate)}`
  );
};
