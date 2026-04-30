"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSuperAdmin = createSuperAdmin;
exports.createGovernment = createGovernment;
exports.createLGA = createLGA;
exports.createUnion = createUnion;
exports.createSeller = createSeller;
exports.createRider = createRider;
const models_1 = require("../models");
const types_1 = require("../models/types");
const error_1 = require("../middleware/error");
// ─── Utility ──────────────────────────────────────────────────────────────────
async function assertPhoneUnique(phone) {
    const existing = await models_1.UserModel.findOne({ phone });
    if (existing) {
        throw new error_1.AppError('An account with this phone number already exists.', 409, 'CONFLICT');
    }
}
async function generateRiderCode(unionCode) {
    const prefix = unionCode.toUpperCase();
    for (let i = 0; i < 20; i++) {
        const numeric = String(Math.floor(1000 + Math.random() * 9000));
        const code = `${prefix}-${numeric}`;
        const exists = await models_1.RiderModel.exists({ riderCode: code });
        if (!exists)
            return code;
    }
    throw new error_1.AppError('Could not generate a unique rider code. Please try again.', 500);
}
async function createSuperAdmin(dto) {
    try {
        const phone = dto.phone.trim();
        await assertPhoneUnique(phone);
        const [user] = await models_1.UserModel.create([{ phone, fullName: dto.fullName.trim(), role: types_1.UserRole.SUPER_ADMIN, isActive: true }]);
        const [superAdmin] = await models_1.UserModel.create([{ userId: user._id, email: dto.email }]);
        return { user, superAdmin };
    }
    catch (err) {
        throw err;
    }
}
async function createGovernment(dto) {
    try {
        const phone = dto.phone.trim();
        await assertPhoneUnique(phone);
        const [user] = await models_1.UserModel.create([{ phone, fullName: dto.fullName.trim(), role: types_1.UserRole.GOVERNMENT, isActive: true }]);
        const [gov] = await models_1.GovernmentModel.create([{
                userId: user._id,
                stateName: dto.stateName.trim(),
                code: dto.code.trim().toUpperCase(),
                totalTicketsAllocated: 0,
                totalRevenueCollected: 0,
            }]);
        return { user, gov };
    }
    catch (err) {
        throw err;
    }
}
async function createLGA(dto) {
    try {
        const phone = dto.phone.trim();
        await assertPhoneUnique(phone);
        const gov = await models_1.GovernmentModel.findById(dto.govId);
        if (!gov)
            throw new error_1.AppError('Government entity not found.', 404, 'NOT_FOUND');
        const [user] = await models_1.UserModel.create([{ phone, fullName: dto.fullName.trim(), role: types_1.UserRole.LGA, isActive: true }]);
        const [lga] = await models_1.LGAModel.create([{
                userId: user._id,
                govId: gov._id,
                lgaName: dto.lgaName.trim(),
                code: dto.code.trim().toUpperCase(),
                ticketQuota: dto.ticketQuota ?? 0,
                ticketsSold: 0,
                expectedRevenue: 0,
                actualRevenue: 0,
                complianceRate: 0,
            }]);
        return { user, lga };
    }
    catch (err) {
        throw err;
    }
}
async function createUnion(dto) {
    try {
        const phone = dto.phone.trim();
        const unionCode = dto.unionCode.trim().toUpperCase();
        const govBase = Number(dto.govBasePrice ?? 100);
        const unionLevy = Number(dto.unionLevy);
        await assertPhoneUnique(phone);
        const lga = await models_1.LGAModel.findById(dto.lgaId);
        if (!lga)
            throw new error_1.AppError('LGA not found.', 404, 'NOT_FOUND');
        const codeExists = await models_1.UnionModel.findOne({ unionCode });
        if (codeExists)
            throw new error_1.AppError(`Union code "${unionCode}" is already taken.`, 409, 'CONFLICT');
        const [user] = await models_1.UserModel.create([{ phone, fullName: dto.fullName.trim(), role: types_1.UserRole.UNION, isActive: true }]);
        const [union] = await models_1.UnionModel.create([{
                userId: user._id,
                lgaId: lga._id,
                unionCode,
                unionName: dto.unionName.trim(),
                govBasePrice: govBase,
                unionLevy,
                finalTicketPrice: govBase + unionLevy,
                ticketAllocation: 0,
                ticketsSold: 0,
                govWalletBalance: 0,
                unionWalletBalance: 0,
            }]);
        return { user, union };
    }
    catch (err) {
        throw err;
    }
}
async function createSeller(dto) {
    try {
        const phone = dto.phone.trim();
        await assertPhoneUnique(phone);
        const union = await models_1.UnionModel.findById(dto.unionId);
        if (!union)
            throw new error_1.AppError('Union not found.', 404, 'NOT_FOUND');
        const [user] = await models_1.UserModel.create([{ phone, fullName: dto.fullName.trim(), role: types_1.UserRole.SELLER, isActive: true }]);
        const [seller] = await models_1.SellerModel.create([{
                userId: user._id,
                unionId: union._id,
                ticketAllocation: dto.ticketAllocation,
                ticketsSoldToday: 0,
                totalTicketsSold: 0,
                nin: dto.nin,
                address: dto.address,
            }]);
        return { user, seller };
    }
    catch (err) {
        throw err;
    }
}
async function createRider(dto) {
    try {
        const phone = dto.phone.trim();
        await assertPhoneUnique(phone);
        const union = await models_1.UnionModel.findById(dto.unionId);
        if (!union)
            throw new error_1.AppError('Union not found.', 404, 'NOT_FOUND');
        const riderCode = await generateRiderCode(union.unionCode);
        const [user] = await models_1.UserModel.create([{ phone, fullName: dto.fullName.trim(), role: types_1.UserRole.RIDER, isActive: true }]);
        const [rider] = await models_1.RiderModel.create([{
                userId: user._id,
                riderCode,
                unionId: union._id,
                originalUnionId: union._id,
                vehicleType: dto.vehicleType,
                vehicleNumber: dto.vehicleNumber.trim().toUpperCase(),
                vehicleMake: dto.vehicleMake,
                nin: dto.nin,
                complianceStatus: 'compliant',
                outstandingBalance: 0,
                transferStatus: 'none',
                phone,
                fullName: dto.fullName.trim(),
            }]);
        return { user, rider, riderCode };
    }
    catch (err) {
        throw err;
    }
}
//# sourceMappingURL=onboarding.service.js.map