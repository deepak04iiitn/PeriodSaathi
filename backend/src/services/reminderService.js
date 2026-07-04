import User from '../models/User.js';
import CycleLog from '../models/CycleLog.js';
import bot from '../bot/index.js';
import * as msg from '../utils/messages.js';
import { getNextPeriodDate } from './predictionService.js';
import { daysBetween } from '../utils/dateHelpers.js';

const BATCH_SIZE = 100;
const OPTS       = { parse_mode: 'HTML' };

// ─────────────────────────────────────────────────────────────────────────────
// runDailyReminders
//
// Called once per day by the cron job. Iterates all active, onboarded users
// in batches of BATCH_SIZE. For each user:
//   - Fetches their latest CycleLog.
//   - Computes daysUntil next period.
//   - Sends the matching reminder if the user has that reminder enabled.
//   - A failure for one user never stops the loop.
// ─────────────────────────────────────────────────────────────────────────────
export const runDailyReminders = async () => {
  const startTime  = Date.now();
  let   processed  = 0;
  let   sent       = 0;
  let   errors     = 0;
  let   lastId     = null; // cursor for keyset pagination

  console.log('[CRON] Daily reminder job started.');

  while (true) {
    // Keyset pagination: fetch the next batch after the last seen _id.
    const query = {
      isPaused:           false,
      onboardingComplete: true,
    };
    if (lastId) query._id = { $gt: lastId };

    const users = await User.find(query)
      .sort({ _id: 1 })
      .limit(BATCH_SIZE)
      .lean();

    if (!users.length) break;

    lastId = users[users.length - 1]._id;
    processed += users.length;

    // Process all users in this batch concurrently.
    const results = await Promise.allSettled(
      users.map((user) => processUser(user))
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        sent += result.value ?? 0;
      } else {
        errors++;
        console.error('[CRON] User processing error:', result.reason?.message);
      }
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(
    `[CRON] Job complete — processed=${processed}, sent=${sent}, errors=${errors}, elapsed=${elapsed}s`
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// processUser — compute daysUntil and send matching reminder(s).
// Returns the number of reminders sent for this user (0 or 1).
// ─────────────────────────────────────────────────────────────────────────────
const processUser = async (user) => {
  const lastLog = await CycleLog.findOne({ telegramId: user.telegramId })
    .sort({ periodStartDate: -1 })
    .lean();

  if (!lastLog) return 0;

  const nextDate  = getNextPeriodDate(user, lastLog);
  const daysUntil = daysBetween(new Date(), nextDate);

  const rs = user.reminderSettings ?? {};

  // ── Reminder dispatch ─────────────────────────────────────────────────────
  if (daysUntil === 3 && rs.threeDays) {
    return sendReminder(user.telegramId, msg.reminder3Days(), '3-day');
  }

  if (daysUntil === 1 && rs.oneDay) {
    return sendReminder(user.telegramId, msg.reminder1Day(), '1-day');
  }

  if (daysUntil === 0 && rs.dayOf) {
    return sendReminder(user.telegramId, msg.reminderDayOf(), 'day-of');
  }

  // ── Late period nudge (stub — fully implemented in Phase 14) ──────────────
  if (daysUntil < -3) {
    // Only nudge once per cycle. nudgeSentAt is cleared when a new log is saved.
    if (!user.nudgeSentAt) {
      await User.updateOne(
        { telegramId: user.telegramId },
        { nudgeSentAt: new Date() }
      );
      return sendReminder(user.telegramId, msg.reminderLate(), 'late-nudge');
    }
  }

  return 0;
};

// ─────────────────────────────────────────────────────────────────────────────
// sendReminder — delivers a single message and logs the send.
// Returns 1 on success, throws on error (caught by Promise.allSettled).
// ─────────────────────────────────────────────────────────────────────────────
const sendReminder = async (telegramId, text, type) => {
  await bot.sendMessage(telegramId, text, OPTS);
  console.log(`[CRON] Sent ${type} reminder to telegramId=${telegramId}`);
  return 1;
};
