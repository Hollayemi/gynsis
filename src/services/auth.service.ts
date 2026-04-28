import bcrypt from 'bcryptjs';
import mongoose, { ClientSession } from 'mongoose';
import {
  UserModel,
  GovernmentModel,
  LGAModel,
  UnionModel,
  SellerModel,
  RiderModel,
} from '../models';
import { UserRole, VehicleType } from '../models/types';
import { AppError } from '../middleware/error';

// ─── Utility ──────────────────────────────────────────────────────────────────

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function comparePassword(
  plain: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

/**
 * Generate a unique 4-digit rider numeric ID that is not yet in use
 * within a given union (union uniqueness), but the numeric suffix is
 * globally tracked so history survives transfers.
 */
async function generateRiderCode(unionCode: string): Promise<string> {
  const prefix = unionCode.toUpperCase();
  let attempts = 0;

  while (attempts < 20) {
    const numeric = Math.floor(1000 + Math.random() * 9000).toString();
    const code = `${prefix}-${numeric}`;
    const exists = await RiderModel.exists({ riderCode: code });
    if (!exists) return code;
    attempts++;
  }

  throw new AppError('Could not generate unique rider code. Try again.', 500);
}

// ─── Login (all roles share one endpoint) ────────────────────────────────────

export interface LoginResult {
  user: {
    id: string;
    fullName: string;
    phone: string;
    role: UserRole;
  };
  profileId: string;
}

export async function loginUser(
  phone: string,
  password: string
): Promise<LoginResult> {
  const normalised = phone.trim();

  const user = await UserModel.findOne({ phone: normalised }).select(
    '+passwordHash'
  );

  if (!user || !(await comparePassword(password, user.passwordHash))) {
    throw new AppError('Invalid phone number or password', 401, 'UNAUTHORIZED');
  }

  if (!user.isActive) {
    throw new AppError(
      'Account has been deactivated. Contact support.',
      403,
      'FORBIDDEN'
    );
  }

  // Resolve the role-specific profile to get its _id
  let profileId = '';

  switch (user.role) {
    case UserRole.GOVERNMENT: {
      const gov = await GovernmentModel.findOne({ userId: user._id });
      profileId = gov?._id?.toString() ?? '';
      break;
    }
    case UserRole.LGA: {
      const lga = await LGAModel.findOne({ userId: user._id });
      profileId = lga?._id?.toString() ?? '';
      break;
    }
    case UserRole.UNION: {
      const union = await UnionModel.findOne({ userId: user._id });
      profileId = union?._id?.toString() ?? '';
      break;
    }
    case UserRole.SELLER: {
      const seller = await SellerModel.findOne({ userId: user._id });
      profileId = seller?._id?.toString() ?? '';
      break;
    }
    case UserRole.RIDER: {
      const rider = await RiderModel.findOne({ userId: user._id });
      profileId = rider?._id?.toString() ?? '';
      break;
    }
  }

  // Stamp last login (fire-and-forget; do not await to keep response fast)
  UserModel.updateOne({ _id: user._id }, { lastLogin: new Date() }).exec();

  return {
    user: {
      id: user._id!.toString(),
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
    },
    profileId,
  };
}

// ─── Government Registration ──────────────────────────────────────────────────

export interface RegisterGovernmentDTO {
  fullName: string;
  phone: string;
  password: string;
  stateName: string;
  govBaseTicketPrice?: number;
}

export async function registerGovernment(dto: RegisterGovernmentDTO) {
  const session: ClientSession = await mongoose.startSession();
  session.startTransaction();

  try {
    const phone = dto.phone.trim();

    const existing = await UserModel.findOne({ phone }).session(session);
    if (existing) {
      throw new AppError(
        'An account with this phone number already exists',
        409,
        'CONFLICT'
      );
    }

    const passwordHash = await hashPassword(dto.password);

    const [user] = await UserModel.create(
      [
        {
          phone,
          passwordHash,
          fullName: dto.fullName.trim(),
          role: UserRole.GOVERNMENT,
          isActive: true,
        },
      ],
      { session }
    );

    const [gov] = await GovernmentModel.create(
      [
        {
          userId: user._id,
          stateName: dto.stateName.trim(),
          totalTicketsAllocated: 0,
          totalRevenueCollected: 0,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return { user, gov };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

// ─── LGA Registration ─────────────────────────────────────────────────────────

export interface RegisterLGADTO {
  fullName: string;
  phone: string;
  password: string;
  lgaName: string;
  govId: string; // Government._id
}

export async function registerLGA(dto: RegisterLGADTO) {
  const session: ClientSession = await mongoose.startSession();
  session.startTransaction();

  try {
    const phone = dto.phone.trim();

    const existing = await UserModel.findOne({ phone }).session(session);
    if (existing) {
      throw new AppError(
        'An account with this phone number already exists',
        409,
        'CONFLICT'
      );
    }

    // Validate gov exists
    const gov = await GovernmentModel.findById(dto.govId).session(session);
    if (!gov) {
      throw new AppError('Government entity not found', 404, 'NOT_FOUND');
    }

    // Ensure LGA name is unique within gov
    const lgaExists = await LGAModel.findOne({
      govId: gov._id,
      lgaName: { $regex: new RegExp(`^${dto.lgaName.trim()}$`, 'i') },
    }).session(session);

    if (lgaExists) {
      throw new AppError(
        'An LGA with this name already exists under this government',
        409,
        'CONFLICT'
      );
    }

    const passwordHash = await hashPassword(dto.password);

    const [user] = await UserModel.create(
      [
        {
          phone,
          passwordHash,
          fullName: dto.fullName.trim(),
          role: UserRole.LGA,
          isActive: true,
        },
      ],
      { session }
    );

    const [lga] = await LGAModel.create(
      [
        {
          userId: user._id,
          govId: gov._id,
          lgaName: dto.lgaName.trim(),
          ticketQuota: 0,
          ticketsSold: 0,
          expectedRevenue: 0,
          actualRevenue: 0,
          complianceRate: 0,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return { user, lga };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

// ─── Union Registration ───────────────────────────────────────────────────────

export interface RegisterUnionDTO {
  fullName: string;
  phone: string;
  password: string;
  unionName: string;
  unionCode: string;
  lgaId: string; // LGA._id
  govBasePrice?: number;
  unionLevy?: number;
}

export async function registerUnion(dto: RegisterUnionDTO) {
  const session: ClientSession = await mongoose.startSession();
  session.startTransaction();

  try {
    const phone = dto.phone.trim();
    const unionCode = dto.unionCode.trim().toUpperCase();

    const existing = await UserModel.findOne({ phone }).session(session);
    if (existing) {
      throw new AppError(
        'An account with this phone number already exists',
        409,
        'CONFLICT'
      );
    }

    const lga = await LGAModel.findById(dto.lgaId).session(session);
    if (!lga) {
      throw new AppError('LGA not found', 404, 'NOT_FOUND');
    }

    // Union code must be globally unique
    const codeExists = await UnionModel.findOne({ unionCode }).session(session);
    if (codeExists) {
      throw new AppError(
        `Union code "${unionCode}" is already taken`,
        409,
        'CONFLICT'
      );
    }

    const govBasePrice = Number(dto.govBasePrice ?? 100);
    const unionLevy = Number(dto.unionLevy ?? 100);

    const passwordHash = await hashPassword(dto.password);

    const [user] = await UserModel.create(
      [
        {
          phone,
          passwordHash,
          fullName: dto.fullName.trim(),
          role: UserRole.UNION,
          isActive: true,
        },
      ],
      { session }
    );

    const [union] = await UnionModel.create(
      [
        {
          userId: user._id,
          lgaId: lga._id,
          unionCode,
          unionName: dto.unionName.trim(),
          govBasePrice,
          unionLevy,
          finalTicketPrice: govBasePrice + unionLevy,
          ticketAllocation: 0,
          ticketsSold: 0,
          govWalletBalance: 0,
          unionWalletBalance: 0,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return { user, union };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

// ─── Ticket Seller Registration ───────────────────────────────────────────────

export interface RegisterSellerDTO {
  fullName: string;
  phone: string;
  password: string;
  unionId: string; // Union._id
}

export async function registerSeller(dto: RegisterSellerDTO) {
  const session: ClientSession = await mongoose.startSession();
  session.startTransaction();

  try {
    const phone = dto.phone.trim();

    const existing = await UserModel.findOne({ phone }).session(session);
    if (existing) {
      throw new AppError(
        'An account with this phone number already exists',
        409,
        'CONFLICT'
      );
    }

    const union = await UnionModel.findById(dto.unionId).session(session);
    if (!union) {
      throw new AppError('Union not found', 404, 'NOT_FOUND');
    }

    const passwordHash = await hashPassword(dto.password);

    const [user] = await UserModel.create(
      [
        {
          phone,
          passwordHash,
          fullName: dto.fullName.trim(),
          role: UserRole.SELLER,
          isActive: true,
        },
      ],
      { session }
    );

    const [seller] = await SellerModel.create(
      [
        {
          userId: user._id,
          unionId: union._id,
          ticketAllocation: 0,
          ticketsSoldToday: 0,
          totalTicketsSold: 0,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return { user, seller };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

// ─── Rider Registration (done at union post) ──────────────────────────────────

export interface RegisterRiderDTO {
  fullName: string;
  phone: string;
  password: string;
  unionId: string; // Union._id
  vehicleType: 'okada' | 'tricycle';
  vehicleNumber: string;
}

export async function registerRider(dto: RegisterRiderDTO) {
  const session: ClientSession = await mongoose.startSession();
  session.startTransaction();

  try {
    const phone = dto.phone.trim();

    const existing = await UserModel.findOne({ phone }).session(session);
    if (existing) {
      throw new AppError(
        'A rider with this phone number already exists',
        409,
        'CONFLICT'
      );
    }

    const union = await UnionModel.findById(dto.unionId).session(session);
    if (!union) {
      throw new AppError('Union not found', 404, 'NOT_FOUND');
    }

    const riderCode = await generateRiderCode(union.unionCode);
    const passwordHash = await hashPassword(dto.password);

    const [user] = await UserModel.create(
      [
        {
          phone,
          passwordHash,
          fullName: dto.fullName.trim(),
          role: UserRole.RIDER,
          isActive: true,
        },
      ],
      { session }
    );

    const [rider] = await RiderModel.create(
      [
        {
          userId: user._id,
          riderCode,
          unionId: union._id,
          originalUnionId: union._id,
          vehicleType: dto.vehicleType as VehicleType,
          vehicleNumber: dto.vehicleNumber.trim().toUpperCase(),
          complianceStatus: 'compliant',
          outstandingBalance: 0,
          transferStatus: 'none',
          phone,
          fullName: dto.fullName.trim(),
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return { user, rider, riderCode };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

// ─── Change Password ──────────────────────────────────────────────────────────

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await UserModel.findById(userId).select('+passwordHash');
  if (!user) throw new AppError('User not found', 404);

  const match = await comparePassword(currentPassword, user.passwordHash);
  if (!match) throw new AppError('Current password is incorrect', 400, 'VALIDATION_ERROR');

  user.passwordHash = await hashPassword(newPassword);
  await user.save();
}

// ─── Get My Profile (returns role-enriched data) ──────────────────────────────

export async function getMyProfile(userId: string, role: UserRole) {
  const user = await UserModel.findById(userId).select('-passwordHash');
  if (!user) throw new AppError('User not found', 404);

  let profile: Record<string, unknown> | null = null;

  switch (role) {
    case UserRole.GOVERNMENT:
      profile = await GovernmentModel.findOne({ userId });
      break;
    case UserRole.LGA:
      profile = await LGAModel.findOne({ userId }).populate('govId', 'stateName');
      break;
    case UserRole.UNION:
      profile = await UnionModel.findOne({ userId }).populate('lgaId', 'lgaName');
      break;
    case UserRole.SELLER:
      profile = await SellerModel.findOne({ userId }).populate('unionId', 'unionName unionCode');
      break;
    case UserRole.RIDER:
      profile = await RiderModel.findOne({ userId }).populate('unionId', 'unionName unionCode finalTicketPrice');
      break;
  }

  return { user, profile };
}
