"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectDriver = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const Driver_1 = __importDefault(require("../models/Driver"));
const error_1 = require("./error");
// Protect driver app routes - only verified drivers may access
exports.protectDriver = (0, error_1.asyncHandler)(async (req, res, next) => {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies?.token) {
        token = req.cookies.token;
    }
    if (!token) {
        return next(new error_1.AppError('Not authorised to access this route', 401, 'UNAUTHORIZED'));
    }
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    }
    catch {
        return next(new error_1.AppError('Invalid or expired token. Please log in again.', 401, 'UNAUTHORIZED'));
    }
    const user = await User_1.default.findById(decoded.id);
    if (!user) {
        return next(new error_1.AppError('Account no longer exists', 401));
    }
    if (user.role !== 'driver') {
        return next(new error_1.AppError('Access restricted to driver accounts only', 403, 'FORBIDDEN'));
    }
    if (!user.isPhoneVerified) {
        return next(new error_1.AppError('Please verify your phone number to continue', 401));
    }
    // Check driver profile status
    const driver = await Driver_1.default.findOne({ userId: user._id });
    if (!driver) {
        return next(new error_1.AppError('Driver profile not found', 404));
    }
    if (driver.status === 'suspended') {
        return next(new error_1.AppError('Your account has been suspended. Please contact support.', 403));
    }
    if (driver.status === 'disabled') {
        return next(new error_1.AppError('Your account has been disabled. Please contact support.', 403));
    }
    req.user = user;
    next();
});
//# sourceMappingURL=driverAuth.js.map