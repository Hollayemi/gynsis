"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// ─── Public ───────────────────────────────────────────────────────────────────
/** Step 1: request OTP */
router.post('/send-otp', auth_controller_1.sendOtpHandler);
/** Step 2: submit OTP → receive access + refresh tokens */
router.post('/verify-otp', auth_controller_1.verifyOtpHandler);
/** Resend OTP (60 s cooldown) */
router.post('/resend-otp', auth_controller_1.resendOtpHandler);
/** Issue new access token from httpOnly refresh cookie */
router.post('/refresh-token', auth_controller_1.refreshTokenHandler);
// ─── Protected ────────────────────────────────────────────────────────────────
router.use(auth_1.protect);
router.post('/logout', auth_controller_1.logoutHandler);
/** Returns user + role profile */
router.get('/me', auth_controller_1.getMeHandler);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map