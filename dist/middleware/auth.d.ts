import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/types';
declare global {
    namespace Express {
        interface Request {
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
export declare const protect: (req: Request, res: Response, next: NextFunction) => void;
export declare const authorizeRoles: (...roles: UserRole[]) => (req: Request, _res: Response, next: NextFunction) => void;
/** Super admin only */
export declare const superAdminOnly: (req: Request, _res: Response, next: NextFunction) => void;
/** Super admin or Government */
export declare const superAdminOrGov: (req: Request, _res: Response, next: NextFunction) => void;
/** Super admin, Government, or LGA */
export declare const managementTier: (req: Request, _res: Response, next: NextFunction) => void;
/** Super admin, Government, LGA, or Union — can read downwards */
export declare const seniorStaff: (req: Request, _res: Response, next: NextFunction) => void;
/** Union or Seller */
export declare const operationalStaff: (req: Request, _res: Response, next: NextFunction) => void;
/** Union only */
export declare const unionOnly: (req: Request, _res: Response, next: NextFunction) => void;
/** Seller only */
export declare const sellerOnly: (req: Request, _res: Response, next: NextFunction) => void;
/** Rider only */
export declare const riderOnly: (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map