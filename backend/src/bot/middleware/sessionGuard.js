import User from '../../models/User.js';

/**
 * Ensures a User document exists for the incoming message/callback before
 * any handler runs. Attaches the live Mongoose doc to the context object so
 * every handler receives it without an extra DB round-trip.
 *
 * Usage:
 *   const ctx = await sessionGuard(msg);
 *   if (!ctx) return;          // sessionGuard already sent an error reply
 *   const { user } = ctx;
 */
const sessionGuard = async (msgOrQuery) => {
  // Support both plain messages and callback_query objects.
  const from = msgOrQuery.from ?? msgOrQuery.message?.from;
  const chatId = msgOrQuery.chat?.id ?? msgOrQuery.message?.chat?.id;

  if (!from || !chatId) return null;

  try {
    const user = await User.findOneAndUpdate(
      { telegramId: from.id },
      {
        $setOnInsert: {
          telegramId: from.id,
          firstName:  from.first_name ?? '',
        },
      },
      {
        upsert:           true,
        new:              true,
        setDefaultsOnInsert: true,
      }
    );

    return { user, chatId, from };
  } catch (err) {
    console.error('[SESSION] Failed to upsert user:', err.message);
    return null;
  }
};

export default sessionGuard;
