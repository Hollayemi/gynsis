import { Request, Response, NextFunction } from 'express';
import { asyncHandler, AppError } from '../middleware/error';
import { AppResponse } from '../middleware/error';
import { sendTokenResponse, verifyToken } from '../helpers/jwt.helper';
import {
  loginUser,
  registerGovernment,
  registerLGA,
  registerUnion,
  registerSeller,
  registerRider,
  changePassword,
  getMyProfile,
} from '../services/auth.service';
import { UserRole } from '../models/types';
import { UserModel } from '../models';
import { Types } from 'mongoose';

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/login
 * Body: { phone, password }
 */
export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { phone, password } = req.body;

    const result = await loginUser(phone, password);

    return sendTokenResponse(
      res,
      new Types.ObjectId(result.user.id),
      result.user.role,
      {
        user: result.user,
        profileId: result.profileId,
      }
    );
  }
);

// ─── Refresh Token ────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/refresh-token
 * Reads httpOnly refresh cookie, issues a new access token.
 */
export const refreshToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token: string | undefined = req.cookies?.refreshToken;

    if (!token) {
      return next(new AppError('No refresh token provided', 401, 'UNAUTHORIZED'));
    }

    let payload: { id: string; role: UserRole };
    try {
      payload = verifyToken(token, process.env.JWT_REFRESH_SECRET!) as {
        id: string;
        role: UserRole;
      };
    } catch {
      return next(
        new AppError('Invalid or expired refresh token. Please log in again.', 401, 'UNAUTHORIZED')
      );
    }

    const user = await UserModel.findById(payload.id).select('isActive role');
    if (!user || !user.isActive) {
      return next(new AppError('Account not found or deactivated', 401, 'UNAUTHORIZED'));
    }

    return sendTokenResponse(res, user._id as Types.ObjectId, user.role as UserRole, {
      user: { id: user._id, role: user.role },
    });
  }
);

// ─── Logout ───────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/logout
 */
export const logout = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    res.cookie('refreshToken', 'none', {
      expires: new Date(Date.now() + 5 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    return (res as AppResponse).success('Logged out successfully');
  }
);

// ─── Me ───────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/auth/me
 * Returns the authenticated user + role profile.
 */
export const getMe = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id, role } = req.user as { id: string; role: UserRole };

    const data = await getMyProfile(id, role);

    return (res as AppResponse).data(data, 'Profile fetched');
  }
);

// ─── Change Password ──────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/auth/change-password
 * Body: { currentPassword, newPassword }
 */
export const updatePassword = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { currentPassword, newPassword } = req.body;
    const userId = (req.user as { id: string }).id;

    await changePassword(userId, currentPassword, newPassword);

    return (res as AppResponse).success('Password updated successfully');
  }
);

// ─── Government Registration ──────────────────────────────────────────────────

/**
 * POST /api/v1/auth/register/government
 */
export const registerGovernmentHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { fullName, phone, password, stateName, govBaseTicketPrice } =
      req.body;

    const { user, gov } = await registerGovernment({
      fullName,
      phone,
      password,
      stateName,
      govBaseTicketPrice: govBaseTicketPrice ? Number(govBaseTicketPrice) : 100,
    });

    return sendTokenResponse(
      res,
      user._id as Types.ObjectId,
      UserRole.GOVERNMENT,
      {
        user: {
          id: user._id,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
        },
        profile: {
          id: gov._id,
          stateName: gov.stateName,
        },
      },
      201
    );
  }
);

// ─── LGA Registration ─────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/register/lga
 */
export const registerLGAHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { fullName, phone, password, lgaName, govId } = req.body;

    const { user, lga } = await registerLGA({
      fullName,
      phone,
      password,
      lgaName,
      govId,
    });

    return sendTokenResponse(
      res,
      user._id as Types.ObjectId,
      UserRole.LGA,
      {
        user: {
          id: user._id,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
        },
        profile: {
          id: lga._id,
          lgaName: lga.lgaName,
        },
      },
      201
    );
  }
);

// ─── Union Registration ───────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/register/union
 */
export const registerUnionHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { fullName, phone, password, unionName, unionCode, lgaId, govBasePrice, unionLevy } =
      req.body;

    const { user, union } = await registerUnion({
      fullName,
      phone,
      password,
      unionName,
      unionCode,
      lgaId,
      govBasePrice: govBasePrice ? Number(govBasePrice) : 100,
      unionLevy: unionLevy ? Number(unionLevy) : 100,
    });

    return sendTokenResponse(
      res,
      user._id as Types.ObjectId,
      UserRole.UNION,
      {
        user: {
          id: user._id,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
        },
        profile: {
          id: union._id,
          unionName: union.unionName,
          unionCode: union.unionCode,
          finalTicketPrice: union.finalTicketPrice,
        },
      },
      201
    );
  }
);

// ─── Seller Registration ──────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/register/seller
 */
export const registerSellerHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { fullName, phone, password, unionId } = req.body;

    const { user, seller } = await registerSeller({
      fullName,
      phone,
      password,
      unionId,
    });

    return sendTokenResponse(
      res,
      user._id as Types.ObjectId,
      UserRole.SELLER,
      {
        user: {
          id: user._id,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
        },
        profile: {
          id: seller._id,
          unionId: seller.unionId,
          ticketAllocation: seller.ticketAllocation,
        },
      },
      201
    );
  }
);

// ─── Rider Registration ───────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/register/rider
 * Intended to be called from the union post (union admin registers rider).
 */
export const registerRiderHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { fullName, phone, password, unionId, vehicleType, vehicleNumber } =
      req.body;

    const { user, rider, riderCode } = await registerRider({
      fullName,
      phone,
      password,
      unionId,
      vehicleType,
      vehicleNumber,
    });

    return sendTokenResponse(
      res,
      user._id as Types.ObjectId,
      UserRole.RIDER,
      {
        user: {
          id: user._id,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
        },
        profile: {
          id: rider._id,
          riderCode,
          vehicleType: rider.vehicleType,
          vehicleNumber: rider.vehicleNumber,
          complianceStatus: rider.complianceStatus,
        },
      },
      201
    );
  }
);
