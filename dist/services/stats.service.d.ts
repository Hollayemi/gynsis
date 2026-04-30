import { UserRole } from '../models/types';
export declare function getSuperAdminStats(): Promise<{
    governments: number;
    lgas: number;
    unions: number;
    sellers: number;
    riders: number;
}>;
export declare function getGovernmentStats(userId: string): Promise<{
    lgas: number;
    unions: number;
    sellers: number;
    riders: number;
    totalTicketsAllocated: any;
    totalRevenueCollected: any;
}>;
export declare function getLGAStats(userId: string): Promise<{
    unions: number;
    sellers: number;
    riders: number;
    ticketQuota: any;
    ticketsSold: any;
    complianceRate: any;
    actualRevenue: any;
}>;
export declare function getUnionStats(userId: string): Promise<{
    sellers: number;
    riders: number;
    ticketAllocation: any;
    ticketsSold: any;
    govWalletBalance: any;
    unionWalletBalance: any;
    finalTicketPrice: any;
}>;
export declare function getStatsByRole(userId: string, role: UserRole): Promise<{
    governments: number;
    lgas: number;
    unions: number;
    sellers: number;
    riders: number;
} | {
    lgas: number;
    unions: number;
    sellers: number;
    riders: number;
    totalTicketsAllocated: any;
    totalRevenueCollected: any;
} | {
    unions: number;
    sellers: number;
    riders: number;
    ticketQuota: any;
    ticketsSold: any;
    complianceRate: any;
    actualRevenue: any;
} | {
    sellers: number;
    riders: number;
    ticketAllocation: any;
    ticketsSold: any;
    govWalletBalance: any;
    unionWalletBalance: any;
    finalTicketPrice: any;
}>;
//# sourceMappingURL=stats.service.d.ts.map