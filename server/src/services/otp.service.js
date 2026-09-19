import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import OtpChallenge from "../models/OtpChallenge.js";

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 3;
const MAX_ATTEMPTS = 3;

const generateOtp = () => {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = 10 ** OTP_LENGTH;

  return crypto
    .randomInt(min, max)
    .toString();
};

const createOtpChallenge = async ({
  userId,
  channel
}) => {
  const otp = generateOtp();

  const otpHash = await bcrypt.hash(otp, 10);

  const expiresAt = new Date(
    Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
  );

  const challenge = await OtpChallenge.create({
    userId,
    channel,
    otpHash,
    expiresAt,
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS
  });

  /*
   * Simulated delivery required by the assignment.
   *
   * The real OTP is NOT returned to the frontend.
   */
  console.log("");
  console.log("[SIMULATED EMAIL]");
  console.log(`To: ${channel === "email" ? "registered email" : "registered mobile"}`);
  console.log(`OTP: ${otp}`);
  console.log(`Challenge ID: ${challenge._id}`);
  console.log(`Expires: ${expiresAt.toISOString()}`);
  console.log("");

  return {
    challengeId: challenge._id.toString(),
    expiresAt
  };
};

export {
  createOtpChallenge,
  generateOtp
};