"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.riderOnly = exports.sellerOnly = exports.unionOnly = exports.operationalStaff = exports.seniorStaff = exports.managementTier = exports.superAdminOrGov = exports.superAdminOnly = exports.authorizeRoles = exports.protect = void 0;
const error_1 = require("./error");
const jwt_helper_1 = require("../helpers/jwt.helper");
const models_1 = require("../models");
const types_1 = require("../models/types");
// ─── protect ─────────────────────────────────────────────────────────────────
exports.protect = (0, error_1.asyncHandler)(async (req, _res, next) => {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies?.token) {
        token = req.cookies.token;
    }
    if (!token) {
        return next(new error_1.AppError('You are not logged in. Please log in to continue.', 401, 'UNAUTHORIZED'));
    }
    let decoded;
    try {
        decoded = (0, jwt_helper_1.verifyToken)(token, process.env.JWT_SECRET);
    }
    catch (err) {
        const message = err.name === 'TokenExpiredError'
            ? 'Your session has expired. Please log in again.'
            : 'Invalid token. Please log in again.';
        return next(new error_1.AppError(message, 401, 'UNAUTHORIZED'));
    }
    const user = await models_1.UserModel.findById(decoded.id).select('fullName phone role isActive');
    if (!user)
        return next(new error_1.AppError('The account belonging to this token no longer exists.', 401, 'UNAUTHORIZED'));
    if (!user.isActive)
        return next(new error_1.AppError('Your account has been deactivated. Please contact support.', 403, 'FORBIDDEN'));
    req.user = {
        id: user._id.toString(),
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
    };
    next();
});
// ─── authorizeRoles ───────────────────────────────────────────────────────────
const authorizeRoles = (...roles) => (req, _res, next) => {
    if (!req.user)
        return next(new error_1.AppError('Not authenticated', 401, 'UNAUTHORIZED'));
    if (!roles.includes(req.user.role)) {
        return next(new error_1.AppError(`Access denied. Restricted to: ${roles.join(', ')}`, 403, 'FORBIDDEN'));
    }
    next();
};
exports.authorizeRoles = authorizeRoles;
// ─── Convenience guards ───────────────────────────────────────────────────────
/** Super admin only */
exports.superAdminOnly = (0, exports.authorizeRoles)(types_1.UserRole.SUPER_ADMIN);
/** Super admin or Government */
exports.superAdminOrGov = (0, exports.authorizeRoles)(types_1.UserRole.SUPER_ADMIN, types_1.UserRole.GOVERNMENT);
/** Super admin, Government, or LGA */
exports.managementTier = (0, exports.authorizeRoles)(types_1.UserRole.SUPER_ADMIN, types_1.UserRole.GOVERNMENT, types_1.UserRole.LGA);
/** Super admin, Government, LGA, or Union — can read downwards */
exports.seniorStaff = (0, exports.authorizeRoles)(types_1.UserRole.SUPER_ADMIN, types_1.UserRole.GOVERNMENT, types_1.UserRole.LGA, types_1.UserRole.UNION);
/** Union or Seller */
exports.operationalStaff = (0, exports.authorizeRoles)(types_1.UserRole.UNION, types_1.UserRole.SELLER);
/** Union only */
exports.unionOnly = (0, exports.authorizeRoles)(types_1.UserRole.UNION);
/** Seller only */
exports.sellerOnly = (0, exports.authorizeRoles)(types_1.UserRole.SELLER);
/** Rider only */
exports.riderOnly = (0, exports.authorizeRoles)(types_1.UserRole.RIDER);
//# sourceMappingURL=auth.js.map