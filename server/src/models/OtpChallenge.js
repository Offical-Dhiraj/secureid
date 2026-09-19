import mongoose from "mongoose";

const otpChallengeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    channel: {
      type: String,
      enum: ["email", "sms", "login"],
      required: true
    },

    otpHash: {
      type: String,
      required: true
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true
    },

    attempts: {
      type: Number,
      default: 0
    },

    maxAttempts: {
      type: Number,
      default: 3
    },

    used: {
      type: Boolean,
      default: false
    },

    usedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const OtpChallenge = mongoose.model(
  "OtpChallenge",
  otpChallengeSchema
);

export default OtpChallenge;