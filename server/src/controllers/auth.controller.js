import bcrypt from "bcryptjs";

import User from "../models/User.js";

import OtpChallenge from "../models/OtpChallenge.js";

import {
    createOtpChallenge
} from "../services/otp.service.js";

const register = async (req, res) => {
    try {
        const {
            fullName,
            email,
            mobile,
            password
        } = req.body;

        /*
         * Basic validation
         */
        if (
            !fullName ||
            !email ||
            !mobile ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "All registration fields are required."
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const normalizedMobile =
            mobile.trim();

        /*
         * Password validation
         */
        const passwordValid =
            password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /[0-9]/.test(password) &&
            /[^A-Za-z0-9]/.test(password);

        if (!passwordValid) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must contain at least 8 characters, one uppercase letter, one number, and one special character."
            });
        }

        /*
         * Check whether email or mobile already exists.
         */
        const existingUser = await User.findOne({
            $or: [
                { email: normalizedEmail },
                { mobile: normalizedMobile }
            ]
        });

        if (existingUser) {
            const duplicateField =
                existingUser.email === normalizedEmail
                    ? "email"
                    : "mobile";

            return res.status(409).json({
                success: false,
                message: `An account with this ${duplicateField} already exists.`
            });
        }

        /*
         * Create user.
         *
         * The User model automatically hashes
         * the password before saving.
         */
        const user = await User.create({
            fullName: fullName.trim(),
            email: normalizedEmail,
            mobile: normalizedMobile,
            password
        });

        /*
         * Generate email OTP challenge.
         */
        const challenge =
            await createOtpChallenge({
                userId: user._id,
                channel: "email"
            });

        return res.status(201).json({
            success: true,
            message:
                "Registration created. Email verification required.",
            data: {
                challengeId: challenge.challengeId,
                expiresAt: challenge.expiresAt,
                nextStep: "email-otp"
            }
        });
    } catch (error) {
        console.error("Registration error:");
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Unable to create account."
        });
    }
};

const verifyEmailOtp = async (req, res) => {
    try {
        const {
            challengeId,
            otp
        } = req.body;

        /*
         * Validate request
         */
        if (!challengeId || !otp) {
            return res.status(400).json({
                success: false,
                message: "Challenge ID and OTP are required."
            });
        }

        /*
         * OTP must be exactly 6 digits.
         */
        if (!/^\d{6}$/.test(String(otp))) {
            return res.status(400).json({
                success: false,
                message: "OTP must be a 6-digit code."
            });
        }

        /*
         * Find the OTP challenge.
         */
        const challenge = await OtpChallenge.findById(
            challengeId
        );

        if (!challenge) {
            return res.status(404).json({
                success: false,
                message: "OTP challenge not found."
            });
        }

        /*
         * Make sure this is an email challenge.
         */
        if (challenge.channel !== "email") {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP challenge."
            });
        }

        /*
         * Prevent reuse of an already consumed OTP.
         */
        if (challenge.used) {
            return res.status(400).json({
                success: false,
                message: "OTP has already been used."
            });
        }

        /*
         * Check maximum attempts.
         */
        if (
            challenge.attempts >=
            challenge.maxAttempts
        ) {
            return res.status(429).json({
                success: false,
                message:
                    "Maximum OTP attempts reached."
            });
        }

        /*
         * Check expiration.
         */
        if (
            new Date() >
            challenge.expiresAt
        ) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired."
            });
        }

        /*
         * Compare submitted OTP with the
         * hashed OTP stored in MongoDB.
         */
        const otpValid =
            await bcrypt.compare(
                String(otp),
                challenge.otpHash
            );

        /*
         * Wrong OTP
         */
        if (!otpValid) {
            challenge.attempts += 1;

            await challenge.save();

            const attemptsRemaining =
                Math.max(
                    challenge.maxAttempts -
                    challenge.attempts,
                    0
                );

            if (
                attemptsRemaining === 0
            ) {
                return res.status(429).json({
                    success: false,
                    message:
                        "Maximum OTP attempts reached.",
                    attemptsRemaining: 0
                });
            }

            return res.status(400).json({
                success: false,
                message: "Invalid OTP.",
                attemptsRemaining
            });
        }

        /*
         * OTP is correct.
         *
         * Mark it as consumed before
         * continuing to the next stage.
         */
        challenge.used = true;
        challenge.usedAt = new Date();

        await challenge.save();

        /*
         * Find the user associated with
         * this challenge.
         */
        const user = await User.findById(
            challenge.userId
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        /*
         * Mark email as verified.
         */
        user.emailVerified = true;

        await user.save();

        /*
         * Email verification is complete.
         *
         * The next registration stage is
         * mobile OTP.
         */
        return res.status(200).json({
            success: true,
            message:
                "Email verified successfully.",
            data: {
                nextStep: "mobile-otp"
            }
        });

    } catch (error) {
        console.error(
            "Email OTP verification error:"
        );

        console.error(error);

        return res.status(500).json({
            success: false,
            message:
                "Unable to verify email OTP."
        });
    }
};

export {
    register,
    verifyEmailOtp

};