// ─────────────────────────────────────────────────────────────────────────────
// Callback data constants — single source of truth for all button payloads.
// Handlers match against these strings; never hard-code payload strings twice.
// ─────────────────────────────────────────────────────────────────────────────
export const CB = {
  LOG_PERIOD:            'LOG_PERIOD',
  MY_CYCLE:              'MY_CYCLE',
  HISTORY:               'HISTORY',
  SETTINGS:              'SETTINGS',

  // Date confirmation
  CONFIRM_DATE_YES:      'CONFIRM_DATE_YES',
  CONFIRM_DATE_NO:       'CONFIRM_DATE_NO',

  // Settings actions
  SETTINGS_EDIT_CYCLE:   'SETTINGS_EDIT_CYCLE',
  SETTINGS_EDIT_PERIOD:  'SETTINGS_EDIT_PERIOD',
  SETTINGS_TOGGLE_3DAY:  'SETTINGS_TOGGLE_3DAY',
  SETTINGS_TOGGLE_1DAY:  'SETTINGS_TOGGLE_1DAY',
  SETTINGS_TOGGLE_DAYOF: 'SETTINGS_TOGGLE_DAYOF',
  SETTINGS_PAUSE:        'SETTINGS_PAUSE',
  SETTINGS_RESUME:       'SETTINGS_RESUME',
  SETTINGS_DELETE:       'SETTINGS_DELETE',
  SETTINGS_DELETE_YES:   'SETTINGS_DELETE_YES',
  SETTINGS_DELETE_NO:    'SETTINGS_DELETE_NO',
  SETTINGS_BACK:         'SETTINGS_BACK',

  // History
  // Dynamic: DELETE_LOG:<logId> — built at runtime
  DELETE_LOG_PREFIX:     'DELETE_LOG:',
  DELETE_LOG_CONFIRM_PREFIX: 'DELETE_LOG_CONFIRM:',
  DELETE_LOG_CANCEL:     'DELETE_LOG_CANCEL',
};

// ─────────────────────────────────────────────────────────────────────────────
// Main menu — persistent reply keyboard shown after onboarding is complete.
// ─────────────────────────────────────────────────────────────────────────────
export const mainMenuKeyboard = () => ({
  reply_markup: {
    keyboard: [
      [{ text: '📅 Log Period' }, { text: '📊 My Cycle' }],
      [{ text: '📜 History'   }, { text: '⚙ Settings'  }],
    ],
    resize_keyboard:   true,
    one_time_keyboard: false,
    persistent:        true,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Date confirmation — shown after a date is parsed, before it is saved.
// ─────────────────────────────────────────────────────────────────────────────
export const confirmDateKeyboard = () => ({
  reply_markup: {
    inline_keyboard: [
      [
        { text: 'Yes, that\'s right ✅', callback_data: CB.CONFIRM_DATE_YES },
        { text: 'No, re-enter ❌',        callback_data: CB.CONFIRM_DATE_NO  },
      ],
    ],
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Settings main menu — reflects live user values.
// ─────────────────────────────────────────────────────────────────────────────
export const settingsKeyboard = (user) => {
  const rs = user.reminderSettings;
  const tick = (on) => (on ? '✅' : '❌');

  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: `✏️ Edit Cycle Length: ${user.avgCycleLength} days`,  callback_data: CB.SETTINGS_EDIT_CYCLE  }],
        [{ text: `✏️ Edit Period Length: ${user.avgPeriodLength} days`, callback_data: CB.SETTINGS_EDIT_PERIOD }],
        [
          { text: `3-day ${tick(rs.threeDays)}`, callback_data: CB.SETTINGS_TOGGLE_3DAY  },
          { text: `1-day ${tick(rs.oneDay)}`,    callback_data: CB.SETTINGS_TOGGLE_1DAY  },
          { text: `Day-of ${tick(rs.dayOf)}`,    callback_data: CB.SETTINGS_TOGGLE_DAYOF },
        ],
        [{ text: user.isPaused ? '▶️ Resume Tracking' : '⏸ Pause Tracking',
           callback_data: user.isPaused ? CB.SETTINGS_RESUME : CB.SETTINGS_PAUSE }],
        [{ text: '🗑 Delete All My Data', callback_data: CB.SETTINGS_DELETE }],
        [{ text: '← Back to Menu',        callback_data: CB.SETTINGS_BACK   }],
      ],
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Delete confirmation — double-check before wiping all data.
// ─────────────────────────────────────────────────────────────────────────────
export const deleteConfirmKeyboard = () => ({
  reply_markup: {
    inline_keyboard: [
      [
        { text: '⚠️ Yes, delete everything', callback_data: CB.SETTINGS_DELETE_YES },
        { text: 'No, go back',               callback_data: CB.SETTINGS_DELETE_NO  },
      ],
    ],
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// History entry — one inline row per CycleLog entry.
// ─────────────────────────────────────────────────────────────────────────────
export const deleteLogButton = (logId) => ({
  text: '🗑 Delete',
  callback_data: `${CB.DELETE_LOG_PREFIX}${logId}`,
});

export const deleteLogConfirmKeyboard = (logId) => ({
  reply_markup: {
    inline_keyboard: [
      [
        { text: 'Yes, delete ✅', callback_data: `${CB.DELETE_LOG_CONFIRM_PREFIX}${logId}` },
        { text: 'Cancel ❌',      callback_data: CB.DELETE_LOG_CANCEL                        },
      ],
    ],
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Remove keyboard helper — strips any persistent keyboard from the next message.
// ─────────────────────────────────────────────────────────────────────────────
export const removeKeyboard = () => ({
  reply_markup: { remove_keyboard: true },
});
