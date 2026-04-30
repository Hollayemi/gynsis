"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtp = sendOtp;
exports.verifyOtp = verifyOtp;
exports.resendOtp = resendOtp;
exports.getMyProfile = getMyProfile;
const models_1 = require("../models");
const types_1 = require("../models/types");
const error_1 = require("../middleware/error");
const otp_helper_1 = require("../helpers/otp.helper");
// ─── Send OTP ─────────────────────────────────────────────────────────────────
async function sendOtp(phone) {
    const normalised = phone.trim();
    const user = await models_1.UserModel.findOne({ phone: normalised });
    if (!user) {
        throw new error_1.AppError('No account found with this phone number. Please contact your administrator.', 404, 'NOT_FOUND');
    }
    if (!user.isActive) {
        throw new error_1.AppError('Your account has been deactivated. Please contact support.', 403, 'FORBIDDEN');
    }
    const code = await (0, otp_helper_1.createOtp)(normalised);
    await (0, otp_helper_1.sendOtpSms)(normalised, code);
    return { phone: normalised, message: 'OTP sent successfully', expiresIn: 600 };
}
// ─── Verify OTP ───────────────────────────────────────────────────────────────
async function verifyOtp(phone, code) {
    const normalised = phone.trim();
    await (0, otp_helper_1.verifyOtpCode)(normalised, code);
    const user = await models_1.UserModel.findOne({ phone: normalised });
    if (!user)
        throw new error_1.AppError('Account not found', 404);
    // Stamp last login (fire-and-forget)
    models_1.UserModel.updateOne({ _id: user._id }, { lastLogin: new Date() }).exec();
    return { user };
}
// ─── Resend OTP ───────────────────────────────────────────────────────────────
async function resendOtp(phone) {
    // 60-second cooldown
    const recent = await models_1.OtpModel.findOne({
        phone: phone.trim(),
        used: false,
        createdAt: { $gte: new Date(Date.now() - 60000) },
    });
    if (recent) {
        throw new error_1.AppError('Please wait 60 seconds before requesting a new OTP.', 429, 'RATE_LIMIT');
    }
    return sendOtp(phone);
}
// ─── Get My Profile ───────────────────────────────────────────────────────────
async function getMyProfile(userId, role) {
    const user = await models_1.UserModel.findById(userId);
    if (!user)
        throw new error_1.AppError('User not found', 404);
    let profile = null;
    switch (role) {
        // Super admin has no separate profile doc — user record is the full profile
        case types_1.UserRole.SUPER_ADMIN:
            profile = null;
            break;
        case types_1.UserRole.GOVERNMENT:
            profile = await models_1.GovernmentModel.findOne({ userId });
            break;
        case types_1.UserRole.LGA:
            profile = await models_1.LGAModel.findOne({ userId }).populate('govId', 'stateName code');
            break;
        case types_1.UserRole.UNION:
            profile = await models_1.UnionModel.findOne({ userId }).populate('lgaId', 'lgaName code');
            break;
        case types_1.UserRole.SELLER:
            profile = await models_1.SellerModel.findOne({ userId }).populate('unionId', 'unionName unionCode');
            break;
        case types_1.UserRole.RIDER:
            profile = await models_1.RiderModel.findOne({ userId }).populate('unionId', 'unionName unionCode finalTicketPrice');
            break;
    }
    return { user, profile };
}
//# sourceMappingURL=auth.service.js.map