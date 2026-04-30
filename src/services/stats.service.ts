import { Types } from 'mongoose';
import {
  GovernmentModel,
  LGAModel,
  UnionModel,
  SellerModel,
  RiderModel,
  UserModel,
} from '../models';
import { UserRole } from '../models/types';
import { AppError } from '../middleware/error';

// ─── Super Admin Stats (everything) ──────────────────────────────────────────

export async function getSuperAdminStats() {
  const [governments, lgas, unions, sellers, riders] = await Promise.all([
    GovernmentModel.countDocuments(),
    LGAModel.countDocuments(),
    UnionModel.countDocuments(),
    SellerModel.countDocuments(),
    RiderModel.countDocuments(),
  ]);
  return { governments, lgas, unions, sellers, riders };
}

// ─── Government Stats (its LGAs and below) ───────────────────────────────────

export async function getGovernmentStats(userId: string) {
  const gov = await GovernmentModel.findOne({ userId });
  if (!gov) throw new AppError('Government profile not found', 404);

  const lgaIds = await LGAModel.find({ govId: gov._id }).distinct('_id');
  const unionIds = await UnionModel.find({ lgaId: { $in: lgaIds } }).distinct('_id');

  const [lgas, unions, sellers, riders] = await Promise.all([
    LGAModel.countDocuments({ govId: gov._id }),
    UnionModel.countDocuments({ lgaId: { $in: lgaIds } }),
    SellerModel.countDocuments({ unionId: { $in: unionIds } }),
    RiderModel.countDocuments({ unionId: { $in: unionIds } }),
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

export async function getLGAStats(userId: string) {
  const lga = await LGAModel.findOne({ userId });
  if (!lga) throw new AppError('LGA profile not found', 404);

  const unionIds = await UnionModel.find({ lgaId: lga._id }).distinct('_id');

  const [unions, sellers, riders] = await Promise.all([
    UnionModel.countDocuments({ lgaId: lga._id }),
    SellerModel.countDocuments({ unionId: { $in: unionIds } }),
    RiderModel.countDocuments({ unionId: { $in: unionIds } }),
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

export async function getUnionStats(userId: string) {
  const union = await UnionModel.findOne({ userId });
  if (!union) throw new AppError('Union profile not found', 404);

  const [sellers, riders] = await Promise.all([
    SellerModel.countDocuments({ unionId: union._id }),
    RiderModel.countDocuments({ unionId: union._id }),
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

export async function getStatsByRole(userId: string, role: UserRole) {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return getSuperAdminStats();
    case UserRole.GOVERNMENT:
      return getGovernmentStats(userId);
    case UserRole.LGA:
      return getLGAStats(userId);
    case UserRole.UNION:
      return getUnionStats(userId);
    default:
      throw new AppError('Stats not available for your role.', 403, 'FORBIDDEN');
  }
}
