import cron from 'node-cron';
import { runDailyReminders } from '../services/reminderService.js';

// ─────────────────────────────────────────────────────────────────────────────
// Daily reminder job — fires at 9:00 AM server time every day.
//
// In production, deploy to a single-process environment (or ensure the cron
// runs in only one instance) to avoid duplicate sends in clustered setups.
// ─────────────────────────────────────────────────────────────────────────────
cron.schedule('0 9 * * *', async () => {
  console.log('[CRON] Triggering daily reminder job (scheduled 09:00).');
  try {
    await runDailyReminders();
  } catch (err) {
    // Top-level guard: log but never crash the process.
    console.error('[CRON] Unhandled error in daily reminder job:', err.message);
  }
}, {
  timezone: 'Asia/Kolkata', // IST — adjust per deployment region
});

console.log('[CRON] Daily reminder job scheduled (09:00 IST every day).');

// ─────────────────────────────────────────────────────────────────────────────
// Export for manual test invocation (e.g., from a test script or admin route).
// ─────────────────────────────────────────────────────────────────────────────
export { runDailyReminders };
