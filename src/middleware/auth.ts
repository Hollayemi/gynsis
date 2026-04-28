import { Request, Response, NextFunction } from 'express';
import { asyncHandler, AppError } from './error';
import { verifyToken, JwtPayload } from '../helpers/jwt.helper';
import { UserModel } from '../models';
import { UserRole } from '../models/types';

// ─── Augment Express Request ──────────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      /** Attached by `protect` after token verification */
      user?: {
        id: string;
        fullName: string;
        phone: string;
        role: UserRole;
        isActive: boolean;
      };
    }
  }
}

// ─── protect ─────────────────────────────────────────────────────────────────

/**
 * Verifies the Bearer access token, loads the user from DB and attaches it
 * to `req.user`. Rejects with 401 if token is missing, invalid, or if the
 * account is deactivated.
 */
export const protect = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      // Legacy fallback – keep for backward compat
      token = req.cookies.token;
    }

    if (!token) {
      return next(
        new AppError(
          'You are not logged in. Please log in to continue.',
          401,
          'UNAUTHORIZED'
        )
      );
    }

    let decoded: JwtPayload;
    try {
      decoded = verifyToken(token, process.env.JWT_SECRET!);
    } catch (err: any) {
      const message =
        err.name === 'TokenExpiredError'
          ? 'Your session has expired. Please log in again.'
          : 'Invalid token. Please log in again.';
      return next(new AppError(message, 401, 'UNAUTHORIZED'));
    }

    const user = await UserModel.findById(decoded.id).select(
      'fullName phone role isActive'
    );

    if (!user) {
      return next(
        new AppError(
          'The account belonging to this token no longer exists.',
          401,
          'UNAUTHORIZED'
        )
      );
    }

    if (!user.isActive) {
      return next(
        new AppError(
          'Your account has been deactivated. Please contact support.',
          403,
          'FORBIDDEN'
        )
      );
    }

    req.user = {
      id: user._id!.toString(),
      fullName: user.fullName,
      phone: user.phone,
      role: user.role as UserRole,
      isActive: user.isActive,
    };

    next();
  }
);

// ─── authorizeRoles ───────────────────────────────────────────────────────────

/**
 * Role-based access control guard.
 * Must be used AFTER `protect`.
 *
 * Usage:
 *   router.get('/dashboard', protect, authorizeRoles(UserRole.GOVERNMENT, UserRole.LGA), handler)
 */
export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401, 'UNAUTHORIZED'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. This route is restricted to: ${roles.join(', ')}`,
          403,
          'FORBIDDEN'
        )
      );
    }

    next();
  };
};

// ─── Convenience role guards ──────────────────────────────────────────────────

/** Allow only Government accounts */
export const governmentOnly = authorizeRoles(UserRole.GOVERNMENT);

/** Allow Government and LGA accounts */
export const governmentOrLGA = authorizeRoles(UserRole.GOVERNMENT, UserRole.LGA);

/** Allow Government, LGA, and Union accounts */
export const managementOnly = authorizeRoles(
  UserRole.GOVERNMENT,
  UserRole.LGA,
  UserRole.UNION
);

/** Allow only Union accounts */
export const unionOnly = authorizeRoles(UserRole.UNION);

/** Allow only Ticket Seller accounts */
export const sellerOnly = authorizeRoles(UserRole.SELLER);

/** Allow only Rider accounts */
export const riderOnly = authorizeRoles(UserRole.RIDER);

/** Allow Union and Seller (operational staff) */
export const operationalStaff = authorizeRoles(UserRole.UNION, UserRole.SELLER);
