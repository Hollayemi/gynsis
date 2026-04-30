import { Request, Response, NextFunction } from 'express';
import { asyncHandler, AppResponse } from '../middleware/error';
import {
  createGovernment,
  createLGA,
  createUnion,
  createSeller,
  createRider,
} from '../services/onboarding.service';
import {
  GovernmentModel,
  LGAModel,
  UnionModel,
  SellerModel,
  RiderModel,
  UserModel,
} from '../models';
import { UserRole } from '../models/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const pagination = (query: any) => ({
  page:  Math.max(1, parseInt(query.page  ?? '1')),
  limit: Math.min(100, parseInt(query.limit ?? '10')),
});

// ═══════════════════════════════════════════════════════════════════════════════
//  GOVERNMENT
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/v1/admin/governments
export const createGovernmentHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { fullName, phone, stateName, code, email, address } = req.body;
    const { user, gov } = await createGovernment({ fullName, phone, stateName, code, email, address });

    return (res as AppResponse).data(
      {
        _id: gov._id,
        userId: user._id,
        stateName: gov.stateName,
        code: gov.code,
        totalTicketsAllocated: gov.totalTicketsAllocated,
        totalRevenueCollected: gov.totalRevenueCollected,
        createdAt: gov.createdAt,
      },
      'Government created successfully',
      201
    );
  }
);

// GET /api/v1/admin/governments
export const getGovernmentsHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { page, limit } = pagination(req.query);
    const skip = (page - 1) * limit;
    const search = req.query.search as string | undefined;

    const filter: Record<string, any> = {};
    if (search) filter.stateName = { $regex: search, $options: 'i' };

    const [governments, total] = await Promise.all([
      GovernmentModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      GovernmentModel.countDocuments(filter),
    ]);

    return (res as AppResponse).data({ governments, total, page, limit }, 'Governments fetched');
  }
);

// GET /api/v1/admin/governments/:id
export const getGovernmentHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const gov = await GovernmentModel.findById(req.params.id);
    if (!gov) return (res as AppResponse).errorMessage('Government not found', 404);

    const user = await UserModel.findById(gov.userId).select('fullName phone isActive lastLogin');
    return (res as AppResponse).data({ ...gov.toObject(), user }, 'Government fetched');
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
//  LGA
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/v1/admin/lgas
export const createLGAHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { fullName, phone, lgaName, code, govId, email, address, ticketQuota } = req.body;
    const { user, lga } = await createLGA({ fullName, phone, lgaName, code, govId, email, address, ticketQuota });

    return (res as AppResponse).data(
      {
        _id: lga._id,
        userId: user._id,
        govId: lga.govId,
        lgaName: lga.lgaName,
        code: lga.code,
        ticketQuota: lga.ticketQuota,
        complianceRate: lga.complianceRate,
        createdAt: lga.createdAt,
      },
      'LGA created successfully',
      201
    );
  }
);

// GET /api/v1/admin/lgas
export const getLGAsHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { page, limit } = pagination(req.query);
    const skip = (page - 1) * limit;
    const filter: Record<string, any> = {};
    if (req.query.govId) filter.govId = req.query.govId;
    if (req.query.search) filter.lgaName = { $regex: req.query.search, $options: 'i' };

    const [lgas, total] = await Promise.all([
      LGAModel.find(filter).populate('govId', 'stateName code').sort({ createdAt: -1 }).skip(skip).limit(limit),
      LGAModel.countDocuments(filter),
    ]);

    return (res as AppResponse).data({ lgas, total, page, limit }, 'LGAs fetched');
  }
);

// GET /api/v1/admin/lgas/:id
export const getLGAHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const lga = await LGAModel.findById(req.params.id).populate('govId', 'stateName code');
    if (!lga) return (res as AppResponse).errorMessage('LGA not found', 404);

    const user = await UserModel.findById(lga.userId).select('fullName phone isActive lastLogin');
    return (res as AppResponse).data({ ...lga.toObject(), user }, 'LGA fetched');
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
//  UNION
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/v1/admin/unions
export const createUnionHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { fullName, phone, unionName, unionCode, lgaId, unionLevy, govBasePrice, email, address } = req.body;
    const { user, union } = await createUnion({ fullName, phone, unionName, unionCode, lgaId, unionLevy, govBasePrice, email, address });

    return (res as AppResponse).data(
      {
        _id: union._id,
        userId: user._id,
        lgaId: union.lgaId,
        unionCode: union.unionCode,
        unionName: union.unionName,
        govBasePrice: union.govBasePrice,
        unionLevy: union.unionLevy,
        finalTicketPrice: union.finalTicketPrice,
        createdAt: union.createdAt,
      },
      'Union created successfully',
      201
    );
  }
);

// GET /api/v1/admin/unions
export const getUnionsHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { page, limit } = pagination(req.query);
    const skip = (page - 1) * limit;
    const filter: Record<string, any> = {};
    if (req.query.lgaId) filter.lgaId = req.query.lgaId;
    if (req.query.search) filter.unionName = { $regex: req.query.search, $options: 'i' };

    const [unions, total] = await Promise.all([
      UnionModel.find(filter).populate('lgaId', 'lgaName code').sort({ createdAt: -1 }).skip(skip).limit(limit),
      UnionModel.countDocuments(filter),
    ]);

    return (res as AppResponse).data({ unions, total, page, limit }, 'Unions fetched');
  }
);

// GET /api/v1/admin/unions/:id
export const getUnionHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const union = await UnionModel.findById(req.params.id).populate('lgaId', 'lgaName code');
    if (!union) return (res as AppResponse).errorMessage('Union not found', 404);

    const user = await UserModel.findById(union.userId).select('fullName phone isActive lastLogin');
    return (res as AppResponse).data({ ...union.toObject(), user }, 'Union fetched');
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
//  SELLER
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/v1/admin/sellers
export const createSellerHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { fullName, phone, unionId, ticketAllocation, nin, address } = req.body;
    const { user, seller } = await createSeller({ fullName, phone, unionId, ticketAllocation, nin, address });

    return (res as AppResponse).data(
      {
        _id: seller._id,
        userId: user._id,
        unionId: seller.unionId,
        ticketAllocation: seller.ticketAllocation,
        createdAt: seller.createdAt,
      },
      'Seller registered successfully',
      201
    );
  }
);

// GET /api/v1/admin/sellers
export const getSellersHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { page, limit } = pagination(req.query);
    const skip = (page - 1) * limit;
    const filter: Record<string, any> = {};
    if (req.query.unionId) filter.unionId = req.query.unionId;

    const [sellers, total] = await Promise.all([
      SellerModel.find(filter)
        .populate('userId', 'fullName phone isActive')
        .populate('unionId', 'unionName unionCode')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      SellerModel.countDocuments(filter),
    ]);

    return (res as AppResponse).data({ sellers, total, page, limit }, 'Sellers fetched');
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
//  RIDER
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/v1/admin/riders
export const createRiderHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { fullName, phone, unionId, vehicleType, vehicleNumber, vehicleMake, nin } = req.body;
    const { user, rider, riderCode } = await createRider({ fullName, phone, unionId, vehicleType, vehicleNumber, vehicleMake, nin });

    return (res as AppResponse).data(
      {
        _id: rider._id,
        userId: user._id,
        riderCode,
        unionId: rider.unionId,
        vehicleType: rider.vehicleType,
        vehicleNumber: rider.vehicleNumber,
        complianceStatus: rider.complianceStatus,
        createdAt: rider.createdAt,
      },
      'Rider registered successfully',
      201
    );
  }
);

// GET /api/v1/admin/riders
export const getRidersHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { page, limit } = pagination(req.query);
    const skip = (page - 1) * limit;
    const filter: Record<string, any> = {};
    if (req.query.unionId) filter.unionId = req.query.unionId;
    if (req.query.search) {
      filter.$or = [
        { riderCode: { $regex: req.query.search, $options: 'i' } },
        { fullName:  { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [riders, total] = await Promise.all([
      RiderModel.find(filter)
        .populate('unionId', 'unionName unionCode')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      RiderModel.countDocuments(filter),
    ]);

    return (res as AppResponse).data({ riders, total, page, limit }, 'Riders fetched');
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
//  STATS — role-scoped
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/v1/admin/stats
export const getStatsHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id, role } = req.user as { id: string; role: UserRole };
    const { getStatsByRole } = await import('../services/stats.service');
    const stats = await getStatsByRole(id, role);
    return (res as AppResponse).data(stats, 'Stats fetched');
  }
);
