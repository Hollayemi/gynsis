"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMeHandler = exports.logoutHandler = exports.refreshTokenHandler = exports.resendOtpHandler = exports.verifyOtpHandler = exports.sendOtpHandler = void 0;
const error_1 = require("../middleware/error");
const jwt_helper_1 = require("../helpers/jwt.helper");
const auth_service_1 = require("../services/auth.service");
const models_1 = require("../models");
// ─── POST /api/v1/auth/send-otp ───────────────────────────────────────────────
exports.sendOtpHandler = (0, error_1.asyncHandler)(async (req, res, _next) => {
    const { phone } = req.body;
    console.log('Received phone number for OTP:', phone);
    if (!phone)
        throw new error_1.AppError('Phone number is required', 400, 'VALIDATION_ERROR');
    const result = await (0, auth_service_1.sendOtp)(phone);
    return res.data(result, 'OTP sent successfully');
});
// ─── POST /api/v1/auth/verify-otp ────────────────────────────────────────────
exports.verifyOtpHandler = (0, error_1.asyncHandler)(async (req, res, _next) => {
    const { phone, otp } = req.body;
    if (!phone || !otp)
        throw new error_1.AppError('Phone and OTP are required', 400, 'VALIDATION_ERROR');
    const { user } = await (0, auth_service_1.verifyOtp)(phone, otp);
    return (0, jwt_helper_1.sendTokenResponse)(res, user._id, user.role, {
        user: {
            _id: user._id,
            fullName: user.fullName,
            phone: user.phone,
            role: user.role,
            isActive: user.isActive,
            lastLogin: user.lastLogin,
        },
    });
});
// ─── POST /api/v1/auth/resend-otp ────────────────────────────────────────────
exports.resendOtpHandler = (0, error_1.asyncHandler)(async (req, res, _next) => {
    const { phone } = req.body;
    if (!phone)
        throw new error_1.AppError('Phone number is required', 400, 'VALIDATION_ERROR');
    const result = await (0, auth_service_1.resendOtp)(phone);
    return res.data(result, 'OTP resent successfully');
});
// ─── POST /api/v1/auth/refresh-token ─────────────────────────────────────────
exports.refreshTokenHandler = (0, error_1.asyncHandler)(async (req, res, next) => {
    const token = req.cookies?.refreshToken;
    if (!token)
        return next(new error_1.AppError('No refresh token provided', 401, 'UNAUTHORIZED'));
    let payload;
    try {
        payload = (0, jwt_helper_1.verifyToken)(token, process.env.JWT_REFRESH_SECRET);
    }
    catch {
        return next(new error_1.AppError('Invalid or expired refresh token. Please log in again.', 401, 'UNAUTHORIZED'));
    }
    const user = await models_1.UserModel.findById(payload.id).select('isActive role');
    if (!user || !user.isActive) {
        return next(new error_1.AppError('Account not found or deactivated', 401, 'UNAUTHORIZED'));
    }
    return (0, jwt_helper_1.sendTokenResponse)(res, user._id, user.role, {
        user: { id: user._id, role: user.role },
    });
});
// ─── POST /api/v1/auth/logout ─────────────────────────────────────────────────
exports.logoutHandler = (0, error_1.asyncHandler)(async (_req, res, _next) => {
    res.cookie('refreshToken', 'none', {
        expires: new Date(Date.now() + 5000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    });
    return res.success('Logged out successfully');
});
// ─── GET /api/v1/auth/me ──────────────────────────────────────────────────────
exports.getMeHandler = (0, error_1.asyncHandler)(async (req, res, _next) => {
    const { id, role } = req.user;
    const data = await (0, auth_service_1.getMyProfile)(id, role);
    return res.data(data, 'Profile fetched');
});
//# sourceMappingURL=auth.controller.js.map