import mongoose from 'mongoose';
import {
  UserModel,
  // SuperAdminModel,
  GovernmentModel,
  LGAModel,
  UnionModel,
  SellerModel,
  RiderModel,
} from '../models';
import { UserRole, VehicleType } from '../models/types';
import { AppError } from '../middleware/error';

// ─── Utility ──────────────────────────────────────────────────────────────────

async function assertPhoneUnique(phone: string) {
  const existing = await UserModel.findOne({ phone })
  if (existing) {
    throw new AppError('An account with this phone number already exists.', 409, 'CONFLICT');
  }
}

async function generateRiderCode(unionCode: string): Promise<string> {
  const prefix = unionCode.toUpperCase();
  for (let i = 0; i < 20; i++) {
    const numeric = String(Math.floor(1000 + Math.random() * 9000));
    const code = `${prefix}-${numeric}`;
    const exists = await RiderModel.exists({ riderCode: code });
    if (!exists) return code;
  }
  throw new AppError('Could not generate a unique rider code. Please try again.', 500);
}

// ─── Super Admin (seed-time only, not exposed as a public route) ──────────────

export interface CreateSuperAdminDTO {
  fullName: string;
  phone: string;
  email?: string;
}

export async function createSuperAdmin(dto: CreateSuperAdminDTO) {
  try {
    const phone = dto.phone.trim();
    await assertPhoneUnique(phone);

    const [user] = await UserModel.create(
      [{ phone, fullName: dto.fullName.trim(), role: UserRole.SUPER_ADMIN, isActive: true }]
    );

    const [superAdmin] = await UserModel.create(
      [{ userId: user._id, email: dto.email }]
    );

    return { user, superAdmin };
  } catch (err) {
    throw err;
  }
}

// ─── Government ───────────────────────────────────────────────────────────────

export interface CreateGovernmentDTO {
  fullName: string;
  phone: string;
  stateName: string;
  code: string;
  email?: string;
  address?: string;
}

export async function createGovernment(dto: CreateGovernmentDTO) {
  try {
    const phone = dto.phone.trim();
    await assertPhoneUnique(phone);

    const [user] = await UserModel.create(
      [{ phone, fullName: dto.fullName.trim(), role: UserRole.GOVERNMENT, isActive: true }]
    );

    const [gov] = await GovernmentModel.create(
      [{
        userId: user._id,
        stateName: dto.stateName.trim(),
        code: dto.code.trim().toUpperCase(),
        totalTicketsAllocated: 0,
        totalRevenueCollected: 0,
      }]
    );

    return { user, gov };
  } catch (err) {
    throw err;
  }
}

// ─── LGA ──────────────────────────────────────────────────────────────────────

export interface CreateLGADTO {
  fullName: string;
  phone: string;
  lgaName: string;
  code: string;
  govId: string;
  email?: string;
  address?: string;
  ticketQuota?: number;
}

export async function createLGA(dto: CreateLGADTO) {
  try {
    const phone = dto.phone.trim();
    await assertPhoneUnique(phone);

    const gov = await GovernmentModel.findById(dto.govId);
    if (!gov) throw new AppError('Government entity not found.', 404, 'NOT_FOUND');

    const [user] = await UserModel.create(
      [{ phone, fullName: dto.fullName.trim(), role: UserRole.LGA, isActive: true }]
    );

    const [lga] = await LGAModel.create(
      [{
        userId: user._id,
        govId: gov._id,
        lgaName: dto.lgaName.trim(),
        code: dto.code.trim().toUpperCase(),
        ticketQuota: dto.ticketQuota ?? 0,
        ticketsSold: 0,
        expectedRevenue: 0,
        actualRevenue: 0,
        complianceRate: 0,
      }]
    );

    return { user, lga };
  } catch (err) {
    throw err;
  }
}

// ─── Union ────────────────────────────────────────────────────────────────────

export interface CreateUnionDTO {
  fullName: string;
  phone: string;
  unionName: string;
  unionCode: string;
  lgaId: string;
  unionLevy: number;
  govBasePrice?: number;
  email?: string;
  address?: string;
}

export async function createUnion(dto: CreateUnionDTO) {
  try {
    const phone      = dto.phone.trim();
    const unionCode  = dto.unionCode.trim().toUpperCase();
    const govBase    = Number(dto.govBasePrice ?? 100);
    const unionLevy  = Number(dto.unionLevy);

    await assertPhoneUnique(phone);

    const lga = await LGAModel.findById(dto.lgaId);
    if (!lga) throw new AppError('LGA not found.', 404, 'NOT_FOUND');

    const codeExists = await UnionModel.findOne({ unionCode });
    if (codeExists) throw new AppError(`Union code "${unionCode}" is already taken.`, 409, 'CONFLICT');

    const [user] = await UserModel.create(
      [{ phone, fullName: dto.fullName.trim(), role: UserRole.UNION, isActive: true }]
    );

    const [union] = await UnionModel.create(
      [{
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
      }]
    );

    return { user, union };
  } catch (err) {
    throw err;
  }
}

// ─── Seller ───────────────────────────────────────────────────────────────────

export interface CreateSellerDTO {
  fullName: string;
  phone: string;
  unionId: string;
  ticketAllocation: number;
  nin?: string;
  address?: string;
}

export async function createSeller(dto: CreateSellerDTO) {
  try {
    const phone = dto.phone.trim();
    await assertPhoneUnique(phone);

    const union = await UnionModel.findById(dto.unionId);
    if (!union) throw new AppError('Union not found.', 404, 'NOT_FOUND');

    const [user] = await UserModel.create(
      [{ phone, fullName: dto.fullName.trim(), role: UserRole.SELLER, isActive: true }]
    );

    const [seller] = await SellerModel.create(
      [{
        userId: user._id,
        unionId: union._id,
        ticketAllocation: dto.ticketAllocation,
        ticketsSoldToday: 0,
        totalTicketsSold: 0,
        nin: dto.nin,
        address: dto.address,
      }]
    );

    return { user, seller };
  } catch (err) {
    throw err;
  }
}

// ─── Rider ────────────────────────────────────────────────────────────────────

export interface CreateRiderDTO {
  fullName: string;
  phone: string;
  unionId: string;
  vehicleType: 'okada' | 'tricycle';
  vehicleNumber: string;
  vehicleMake?: string;
  nin?: string;
}

export async function createRider(dto: CreateRiderDTO) {
  try {
    const phone = dto.phone.trim();
    await assertPhoneUnique(phone);

    const union = await UnionModel.findById(dto.unionId);
    if (!union) throw new AppError('Union not found.', 404, 'NOT_FOUND');

    const riderCode = await generateRiderCode(union.unionCode);

    const [user] = await UserModel.create(
      [{ phone, fullName: dto.fullName.trim(), role: UserRole.RIDER, isActive: true }]
    );

    const [rider] = await RiderModel.create(
      [{
        userId: user._id,
        riderCode,
        unionId: union._id,
        originalUnionId: union._id,
        vehicleType: dto.vehicleType as VehicleType,
        vehicleNumber: dto.vehicleNumber.trim().toUpperCase(),
        vehicleMake: dto.vehicleMake,
        nin: dto.nin,
        complianceStatus: 'compliant',
        outstandingBalance: 0,
        transferStatus: 'none',
        phone,
        fullName: dto.fullName.trim(),
      }]
    );

    return { user, rider, riderCode };
  } catch (err) {
    throw err;
  }
}
