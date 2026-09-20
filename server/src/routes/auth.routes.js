import express from "express";

import {
  register,
  verifyEmailOtp
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post(
  "/register",
  register
);

router.post(
  "/verify-email-otp",
  verifyEmailOtp
);

export default router;