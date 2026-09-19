import User from "../models/User.js";
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

export {
    register
};