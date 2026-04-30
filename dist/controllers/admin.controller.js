"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatsHandler = exports.getRidersHandler = exports.createRiderHandler = exports.getSellersHandler = exports.createSellerHandler = exports.getUnionHandler = exports.getUnionsHandler = exports.createUnionHandler = exports.getLGAHandler = exports.getLGAsHandler = exports.createLGAHandler = exports.getGovernmentHandler = exports.getGovernmentsHandler = exports.createGovernmentHandler = void 0;
const error_1 = require("../middleware/error");
const onboarding_service_1 = require("../services/onboarding.service");
const models_1 = require("../models");
// ─── Helpers ──────────────────────────────────────────────────────────────────
const pagination = (query) => ({
    page: Math.max(1, parseInt(query.page ?? '1')),
    limit: Math.min(100, parseInt(query.limit ?? '10')),
});
// ═══════════════════════════════════════════════════════════════════════════════
//  GOVERNMENT
// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/v1/admin/governments
exports.createGovernmentHandler = (0, error_1.asyncHandler)(async (req, res, _next) => {
    const { fullName, phone, stateName, code, email, address } = req.body;
    const { user, gov } = await (0, onboarding_service_1.createGovernment)({ fullName, phone, stateName, code, email, address });
    return res.data({
        _id: gov._id,
        userId: user._id,
        stateName: gov.stateName,
        code: gov.code,
        totalTicketsAllocated: gov.totalTicketsAllocated,
        totalRevenueCollected: gov.totalRevenueCollected,
        createdAt: gov.createdAt,
    }, 'Government created successfully', 201);
});
// GET /api/v1/admin/governments
exports.getGovernmentsHandler = (0, error_1.asyncHandler)(async (req, res, _next) => {
    const { page, limit } = pagination(req.query);
    const skip = (page - 1) * limit;
    const search = req.query.search;
    const filter = {};
    if (search)
        filter.stateName = { $regex: search, $options: 'i' };
    const [governments, total] = await Promise.all([
        models_1.GovernmentModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        models_1.GovernmentModel.countDocuments(filter),
    ]);
    return res.data({ governments, total, page, limit }, 'Governments fetched');
});
// GET /api/v1/admin/governments/:id
exports.getGovernmentHandler = (0, error_1.asyncHandler)(async (req, res, _next) => {
    const gov = await models_1.GovernmentModel.findById(req.params.id);
    if (!gov)
        return res.errorMessage('Government not found', 404);
    const user = await models_1.UserModel.findById(gov.userId).select('fullName phone isActive lastLogin');
    return res.data({ ...gov.toObject(), user }, 'Government fetched');
});
// ═══════════════════════════════════════════════════════════════════════════════
//  LGA
// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/v1/admin/lgas
exports.createLGAHandler = (0, error_1.asyncHandler)(async (req, res, _next) => {
    const { fullName, phone, lgaName, code, govId, email, address, ticketQuota } = req.body;
    const { user, lga } = await (0, onboarding_service_1.createLGA)({ fullName, phone, lgaName, code, govId, email, address, ticketQuota });
    return res.data({
        _id: lga._id,
        userId: user._id,
        govId: lga.govId,
        lgaName: lga.lgaName,
        code: lga.code,
        ticketQuota: lga.ticketQuota,
        complianceRate: lga.complianceRate,
        createdAt: lga.createdAt,
    }, 'LGA created successfully', 201);
});
// GET /api/v1/admin/lgas
exports.getLGAsHandler = (0, error_1.asyncHandler)(async (req, res, _next) => {
    const { page, limit } = pagination(req.query);
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.govId)
        filter.govId = req.query.govId;
    if (req.query.search)
        filter.lgaName = { $regex: req.query.search, $options: 'i' };
    const [lgas, total] = await Promise.all([
        models_1.LGAModel.find(filter).populate('govId', 'stateName code').sort({ createdAt: -1 }).skip(skip).limit(limit),
        models_1.LGAModel.countDocuments(filter),
    ]);
    return res.data({ lgas, total, page, limit }, 'LGAs fetched');
});
// GET /api/v1/admin/lgas/:id
exports.getLGAHandler = (0, error_1.asyncHandler)(async (req, res, _next) => {
    const lga = await models_1.LGAModel.findById(req.params.id).populate('govId', 'stateName code');
    if (!lga)
        return res.errorMessage('LGA not found', 404);
    const user = await models_1.UserModel.findById(lga.userId).select('fullName phone isActive lastLogin');
    return res.data({ ...lga.toObject(), user }, 'LGA fetched');
});
// ═══════════════════════════════════════════════════════════════════════════════
//  UNION
// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/v1/admin/unions
exports.createUnionHandler = (0, error_1.asyncHandler)(async (req, res, _next) => {
    const { fullName, phone, unionName, unionCode, lgaId, unionLevy, govBasePrice, email, address } = req.body;
    const { user, union } = await (0, onboarding_service_1.createUnion)({ fullName, phone, unionName, unionCode, lgaId, unionLevy, govBasePrice, email, address });
    return res.data({
        _id: union._id,
        userId: user._id,
        lgaId: union.lgaId,
        unionCode: union.unionCode,
        unionName: union.unionName,
        govBasePrice: union.govBasePrice,
        unionLevy: union.unionLevy,
        finalTicketPrice: union.finalTicketPrice,
        createdAt: union.createdAt,
    }, 'Union created successfully', 201);
});
// GET /api/v1/admin/unions
exports.getUnionsHandler = (0, error_1.asyncHandler)(async (req, res, _next) => {
    const { page, limit } = pagination(req.query);
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.lgaId)
        filter.lgaId = req.query.lgaId;
    if (req.query.search)
        filter.unionName = { $regex: req.query.search, $options: 'i' };
    const [unions, total] = await Promise.all([
        models_1.UnionModel.find(filter).populate('lgaId', 'lgaName code').sort({ createdAt: -1 }).skip(skip).limit(limit),
        models_1.UnionModel.countDocuments(filter),
    ]);
    return res.data({ unions, total, page, limit }, 'Unions fetched');
});
// GET /api/v1/admin/unions/:id
exports.getUnionHandler = (0, error_1.asyncHandler)(async (req, res, _next) => {
    const union = await models_1.UnionModel.findById(req.params.id).populate('lgaId', 'lgaName code');
    if (!union)
        return res.errorMessage('Union not found', 404);
    const user = await models_1.UserModel.findById(union.userId).select('fullName phone isActive lastLogin');
    return res.data({ ...union.toObject(), user }, 'Union fetched');
});
// ═══════════════════════════════════════════════════════════════════════════════
//  SELLER
// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/v1/admin/sellers
exports.createSellerHandler = (0, error_1.asyncHandler)(async (req, res, _next) => {
    const { fullName, phone, unionId, ticketAllocation, nin, address } = req.body;
    const { user, seller } = await (0, onboarding_service_1.createSeller)({ fullName, phone, unionId, ticketAllocation, nin, address });
    return res.data({
        _id: seller._id,
        userId: user._id,
        unionId: seller.unionId,
        ticketAllocation: seller.ticketAllocation,
        createdAt: seller.createdAt,
    }, 'Seller registered successfully', 201);
});
// GET /api/v1/admin/sellers
exports.getSellersHandler = (0, error_1.asyncHandler)(async (req, res, _next) => {
    const { page, limit } = pagination(req.query);
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.unionId)
        filter.unionId = req.query.unionId;
    const [sellers, total] = await Promise.all([
        models_1.SellerModel.find(filter)
            .populate('userId', 'fullName phone isActive')
            .populate('unionId', 'unionName unionCode')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        models_1.SellerModel.countDocuments(filter),
    ]);
    return res.data({ sellers, total, page, limit }, 'Sellers fetched');
});
// ═══════════════════════════════════════════════════════════════════════════════
//  RIDER
// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/v1/admin/riders
exports.createRiderHandler = (0, error_1.asyncHandler)(async (req, res, _next) => {
    const { fullName, phone, unionId, vehicleType, vehicleNumber, vehicleMake, nin } = req.body;
    const { user, rider, riderCode } = await (0, onboarding_service_1.createRider)({ fullName, phone, unionId, vehicleType, vehicleNumber, vehicleMake, nin });
    return res.data({
        _id: rider._id,
        userId: user._id,
        riderCode,
        unionId: rider.unionId,
        vehicleType: rider.vehicleType,
        vehicleNumber: rider.vehicleNumber,
        complianceStatus: rider.complianceStatus,
        createdAt: rider.createdAt,
    }, 'Rider registered successfully', 201);
});
// GET /api/v1/admin/riders
exports.getRidersHandler = (0, error_1.asyncHandler)(async (req, res, _next) => {
    const { page, limit } = pagination(req.query);
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.unionId)
        filter.unionId = req.query.unionId;
    if (req.query.search) {
        filter.$or = [
            { riderCode: { $regex: req.query.search, $options: 'i' } },
            { fullName: { $regex: req.query.search, $options: 'i' } },
        ];
    }
    const [riders, total] = await Promise.all([
        models_1.RiderModel.find(filter)
            .populate('unionId', 'unionName unionCode')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        models_1.RiderModel.countDocuments(filter),
    ]);
    return res.data({ riders, total, page, limit }, 'Riders fetched');
});
// ═══════════════════════════════════════════════════════════════════════════════
//  STATS — role-scoped
// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/v1/admin/stats
exports.getStatsHandler = (0, error_1.asyncHandler)(async (req, res, _next) => {
    const { id, role } = req.user;
    const { getStatsByRole } = await Promise.resolve().then(() => __importStar(require('../services/stats.service')));
    const stats = await getStatsByRole(id, role);
    return res.data(stats, 'Stats fetched');
});
//# sourceMappingURL=admin.controller.js.map