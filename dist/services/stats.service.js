"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSuperAdminStats = getSuperAdminStats;
exports.getGovernmentStats = getGovernmentStats;
exports.getLGAStats = getLGAStats;
exports.getUnionStats = getUnionStats;
exports.getStatsByRole = getStatsByRole;
const models_1 = require("../models");
const types_1 = require("../models/types");
const error_1 = require("../middleware/error");
// ─── Super Admin Stats (everything) ──────────────────────────────────────────
async function getSuperAdminStats() {
    const [governments, lgas, unions, sellers, riders] = await Promise.all([
        models_1.GovernmentModel.countDocuments(),
        models_1.LGAModel.countDocuments(),
        models_1.UnionModel.countDocuments(),
        models_1.SellerModel.countDocuments(),
        models_1.RiderModel.countDocuments(),
    ]);
    return { governments, lgas, unions, sellers, riders };
}
// ─── Government Stats (its LGAs and below) ───────────────────────────────────
async function getGovernmentStats(userId) {
    const gov = await models_1.GovernmentModel.findOne({ userId });
    if (!gov)
        throw new error_1.AppError('Government profile not found', 404);
    const lgaIds = await models_1.LGAModel.find({ govId: gov._id }).distinct('_id');
    const unionIds = await models_1.UnionModel.find({ lgaId: { $in: lgaIds } }).distinct('_id');
    const [lgas, unions, sellers, riders] = await Promise.all([
        models_1.LGAModel.countDocuments({ govId: gov._id }),
        models_1.UnionModel.countDocuments({ lgaId: { $in: lgaIds } }),
        models_1.SellerModel.countDocuments({ unionId: { $in: unionIds } }),
        models_1.RiderModel.countDocuments({ unionId: { $in: unionIds } }),
    ]);
    return {
        lgas,
        unions,
        sellers,
        riders,
        totalTicketsAllocated: gov.totalTicketsAllocated,
        totalRevenueCollected: gov.totalRevenueCollected,
    };
}
// ─── LGA Stats (its unions and below) ────────────────────────────────────────
async function getLGAStats(userId) {
    const lga = await models_1.LGAModel.findOne({ userId });
    if (!lga)
        throw new error_1.AppError('LGA profile not found', 404);
    const unionIds = await models_1.UnionModel.find({ lgaId: lga._id }).distinct('_id');
    const [unions, sellers, riders] = await Promise.all([
        models_1.UnionModel.countDocuments({ lgaId: lga._id }),
        models_1.SellerModel.countDocuments({ unionId: { $in: unionIds } }),
        models_1.RiderModel.countDocuments({ unionId: { $in: unionIds } }),
    ]);
    return {
        unions,
        sellers,
        riders,
        ticketQuota: lga.ticketQuota,
        ticketsSold: lga.ticketsSold,
        complianceRate: lga.complianceRate,
        actualRevenue: lga.actualRevenue,
    };
}
// ─── Union Stats (its sellers and riders) ─────────────────────────────────────
async function getUnionStats(userId) {
    const union = await models_1.UnionModel.findOne({ userId });
    if (!union)
        throw new error_1.AppError('Union profile not found', 404);
    const [sellers, riders] = await Promise.all([
        models_1.SellerModel.countDocuments({ unionId: union._id }),
        models_1.RiderModel.countDocuments({ unionId: union._id }),
    ]);
    return {
        sellers,
        riders,
        ticketAllocation: union.ticketAllocation,
        ticketsSold: union.ticketsSold,
        govWalletBalance: union.govWalletBalance,
        unionWalletBalance: union.unionWalletBalance,
        finalTicketPrice: union.finalTicketPrice,
    };
}
// ─── Role-dispatched stats ────────────────────────────────────────────────────
async function getStatsByRole(userId, role) {
    switch (role) {
        case types_1.UserRole.SUPER_ADMIN:
            return getSuperAdminStats();
        case types_1.UserRole.GOVERNMENT:
            return getGovernmentStats(userId);
        case types_1.UserRole.LGA:
            return getLGAStats(userId);
        case types_1.UserRole.UNION:
            return getUnionStats(userId);
        default:
            throw new error_1.AppError('Stats not available for your role.', 403, 'FORBIDDEN');
    }
}
//# sourceMappingURL=stats.service.js.map