import mongoose from 'mongoose';

const reminderSettingsSchema = new mongoose.Schema(
  {
    threeDays: { type: Boolean, default: true },
    oneDay:    { type: Boolean, default: true },
    dayOf:     { type: Boolean, default: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    telegramId: {
      type:     Number,
      required: true,
      unique:   true,
      index:    true,
    },
    firstName: {
      type:    String,
      default: '',
    },
    avgCycleLength: {
      type:    Number,
      default: 28,
      min:     15,
      max:     60,
    },
    avgPeriodLength: {
      type:    Number,
      default: 5,
      min:     1,
      max:     14,
    },
    reminderSettings: {
      type:    reminderSettingsSchema,
      default: () => ({}),
    },
    isPaused: {
      type:    Boolean,
      default: false,
    },
    onboardingComplete: {
      type:    Boolean,
      default: false,
    },
    // Tracks which conversational flow step the user is currently in.
    // null means idle — no active flow.
    pendingAction: {
      type:    String,
      default: null,
    },
    // Populated only when a date has been parsed and is awaiting user confirmation.
    pendingDate: {
      type:    Date,
      default: null,
    },
    // Set when a late-period nudge has been sent so we don't repeat it.
    nudgeSentAt: {
      type:    Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Strip internal Mongoose fields before logging — never log raw Mongoose docs.
userSchema.methods.toSafeObject = function () {
  return {
    telegramId:         this.telegramId,
    firstName:          this.firstName,
    avgCycleLength:     this.avgCycleLength,
    avgPeriodLength:    this.avgPeriodLength,
    reminderSettings:   this.reminderSettings.toObject?.() ?? this.reminderSettings,
    isPaused:           this.isPaused,
    onboardingComplete: this.onboardingComplete,
    pendingAction:      this.pendingAction,
    createdAt:          this.createdAt,
  };
};

const User = mongoose.model('User', userSchema);

export default User;
