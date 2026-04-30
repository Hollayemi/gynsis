import { UserRole } from '../models/types';
export declare function sendOtp(phone: string): Promise<{
    phone: string;
    message: string;
    expiresIn: number;
}>;
export declare function verifyOtp(phone: string, code: string): Promise<{
    user: any;
}>;
export declare function resendOtp(phone: string): Promise<{
    phone: string;
    message: string;
    expiresIn: number;
}>;
export declare function getMyProfile(userId: string, role: UserRole): Promise<{
    user: any;
    profile: Record<string, unknown> | null;
}>;
//# sourceMappingURL=auth.service.d.ts.map