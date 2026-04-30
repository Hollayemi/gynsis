export interface CreateSuperAdminDTO {
    fullName: string;
    phone: string;
    email?: string;
}
export declare function createSuperAdmin(dto: CreateSuperAdminDTO): Promise<{
    user: any;
    superAdmin: any;
}>;
export interface CreateGovernmentDTO {
    fullName: string;
    phone: string;
    stateName: string;
    code: string;
    email?: string;
    address?: string;
}
export declare function createGovernment(dto: CreateGovernmentDTO): Promise<{
    user: any;
    gov: any;
}>;
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
export declare function createLGA(dto: CreateLGADTO): Promise<{
    user: any;
    lga: any;
}>;
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
export declare function createUnion(dto: CreateUnionDTO): Promise<{
    user: any;
    union: any;
}>;
export interface CreateSellerDTO {
    fullName: string;
    phone: string;
    unionId: string;
    ticketAllocation: number;
    nin?: string;
    address?: string;
}
export declare function createSeller(dto: CreateSellerDTO): Promise<{
    user: any;
    seller: any;
}>;
export interface CreateRiderDTO {
    fullName: string;
    phone: string;
    unionId: string;
    vehicleType: 'okada' | 'tricycle';
    vehicleNumber: string;
    vehicleMake?: string;
    nin?: string;
}
export declare function createRider(dto: CreateRiderDTO): Promise<{
    user: any;
    rider: any;
    riderCode: string;
}>;
//# sourceMappingURL=onboarding.service.d.ts.map