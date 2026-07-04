import CycleLog from '../models/CycleLog.js';
import {
  getNextPeriodDate,
  getCurrentCycleDay,
  getFertileWindow,
} from '../services/predictionService.js';
import * as msg from '../utils/messages.js';
import { mainMenuKeyboard } from '../utils/keyboard.js';
import { daysBetween } from '../utils/dateHelpers.js';

const OPTS = { parse_mode: 'HTML' };

// ─────────────────────────────────────────────────────────────────────────────
// handleMyCycle
//
// Shows the user's current cycle status:
//   - Last period start date
//   - Current cycle day (Day N)
//   - Predicted next period date + days until / overdue
//   - Average cycle length
//   - Fertile window (when enabled in Phase 14)
// ─────────────────────────────────────────────────────────────────────────────
export const handleMyCycle = async (bot, chatId, user) => {
  const lastLog = await CycleLog.findOne({ telegramId: user.telegramId })
    .sort({ periodStartDate: -1 })
    .lean();

  // No cycle data yet — prompt to log the first period.
  if (!lastLog) {
    await bot.sendMessage(
      chatId,
      msg.noCycleData(),
      { ...OPTS, ...mainMenuKeyboard() }
    );
    return;
  }

  const cycleDay   = getCurrentCycleDay(lastLog);
  const nextDate   = getNextPeriodDate(user, lastLog);
  const daysUntil  = daysBetween(new Date(), nextDate);

  // Fertile window — returns null until Phase 14 enables it.
  const fertileWindow = getFertileWindow(nextDate, user.avgCycleLength);

  const overviewData = {
    lastStart:      lastLog.periodStartDate,
    cycleDay:       Math.max(cycleDay, 1), // guard against negative (clock skew / backdated log)
    nextDate,
    daysUntil,
    avgCycleLength: user.avgCycleLength,
    fertileWindow,
  };

  await bot.sendMessage(
    chatId,
    msg.cycleOverview(overviewData),
    { ...OPTS, ...mainMenuKeyboard() }
  );

  console.log(
    `[MY_CYCLE] Overview sent to telegramId=${user.telegramId}: ` +
    `day=${overviewData.cycleDay}, daysUntil=${daysUntil}, ` +
    `nextDate=${nextDate.toISOString().slice(0, 10)}`
  );
};
