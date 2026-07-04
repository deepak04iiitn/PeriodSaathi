import mongoose from 'mongoose';

const cycleLogSchema = new mongoose.Schema(
  {
    telegramId: {
      type:     Number,
      required: true,
      index:    true,
    },
    periodStartDate: {
      type:     Date,
      required: true,
    },
    // Logged later via a follow-up prompt (Phase 14).
    periodEndDate: {
      type:    Date,
      default: null,
    },
    // Days between this log's periodStartDate and the previous log's periodStartDate.
    // Null for the very first log — no prior entry to compare against.
    cycleLength: {
      type:    Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: all history and prediction queries are scoped to a single
// user and sorted newest-first, so this covers both patterns efficiently.
cycleLogSchema.index({ telegramId: 1, periodStartDate: -1 });

const CycleLog = mongoose.model('CycleLog', cycleLogSchema);

export default CycleLog;
