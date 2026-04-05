// import { ObjectId } from 'mongodb';

import { ObjectId } from "mongoose";

// Enums
export enum UserRole {
  GOVERNMENT = 'government',
  LGA = 'lga',
  UNION = 'union',
  SELLER = 'seller',
  RIDER = 'rider'
}

export enum VehicleType {
  OKADA = 'okada',
  TRICYCLE = 'tricycle'
}

export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  WARNING = 'warning',
  VIOLATION = 'violation'
}

export enum TransferStatus {
  NONE = 'none',
  PENDING = 'pending',
  CLEARANCE_CHECK = 'clearance_check',
  APPROVED_BY_UNION_A = 'approved_by_union_a',
  APPROVED_BY_UNION_B = 'approved_by_union_b',
  LGA_APPROVED = 'lga_approved',
  COMPLETED = 'completed',
  REJECTED = 'rejected'
}

export enum PaymentMethod {
  CASH = 'cash',
  WALLET = 'wallet',
  TRANSFER = 'transfer'
}

export enum SyncStatus {
  PENDING_SYNC = 'pending_sync',
  SYNCED = 'synced'
}

export enum EntityType {
  UNION = 'union',
  LGA = 'lga'
}

// Base Interface with common fields
export interface BaseModel {
  _id?: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

// Location type for GPS
export interface GPSLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

// User Interface
export interface IUser extends BaseModel {
  phone: string;
  passwordHash: string;
  role: UserRole;
  fullName: string;
  isActive: boolean;
  lastLogin?: Date;
}

// Government Interface
export interface IGovernment extends BaseModel {
  userId: ObjectId;
  stateName: string;
  totalTicketsAllocated: number;
  totalRevenueCollected: number;
}

// LGA Interface
export interface ILGA extends BaseModel {
  userId: ObjectId;
  govId: ObjectId;
  lgaName: string;
  ticketQuota: number;
  ticketsSold: number;
  expectedRevenue: number;
  actualRevenue: number;
  complianceRate: number;
}

// Union Interface
export interface IUnion extends BaseModel {
  userId: ObjectId;
  lgaId: ObjectId;
  unionCode: string; // 4 chars e.g., "IKJA"
  unionName: string;
  govBasePrice: number;
  unionLevy: number;
  finalTicketPrice: number;
  ticketAllocation: number;
  ticketsSold: number;
  govWalletBalance: number;
  unionWalletBalance: number;
  lastRemittanceDate?: Date;
}

// Rider Interface
export interface IRider extends BaseModel {
  userId: ObjectId;
  riderCode: string; // "IKJA-4582" format
  unionId: ObjectId;
  originalUnionId: ObjectId;
  vehicleType: VehicleType;
  vehicleNumber: string;
  complianceStatus: ComplianceStatus;
  lastPaymentDate?: Date;
  outstandingBalance: number;
  transferStatus: TransferStatus;
  phone: string; // Denormalized for quick lookup
  fullName: string; // Denormalized for quick lookup
}

// Seller Interface
export interface ISeller extends BaseModel {
  userId: ObjectId;
  unionId: ObjectId;
  ticketAllocation: number;
  ticketsSoldToday: number;
  totalTicketsSold: number;
  lastSyncTime?: Date;
}

// Ticket Transaction Interface
export interface ITicketTransaction extends BaseModel {
  riderId: ObjectId;
  sellerId: ObjectId;
  unionId: ObjectId;
  lgaId: ObjectId;
  amountPaid: number;
  govPortion: number;
  unionPortion: number;
  paymentMethod: PaymentMethod;
  paymentDate: Date;
  gpsLocation?: GPSLocation;
  receiptNumber: string;
  syncStatus: SyncStatus;
  riderCode: string; // Denormalized for quick lookup
  unionCode: string; // Denormalized for quick lookup
}

// Transfer Request Interface
export interface ITransferRequest extends BaseModel {
  riderId: ObjectId;
  fromUnionId: ObjectId;
  toUnionId: ObjectId;
  lgaId: ObjectId;
  status: TransferStatus;
  clearanceCertificate?: string; // URL to PDF
  requestDate: Date;
  completionDate?: Date;
  gracePeriodEnd?: Date;
  rejectionReason?: string;
  riderCode: string; // Denormalized for quick lookup
  fromUnionName: string; // Denormalized
  toUnionName: string; // Denormalized
}

// Revenue Remittance Interface
export interface IRevenueRemittance extends BaseModel {
  fromEntityType: EntityType;
  fromEntityId: ObjectId;
  toEntityType: EntityType;
  toEntityId: ObjectId;
  amount: number;
  paymentReference: string;
  remittanceDate: Date;
  ticketTransactionsIncluded: ObjectId[];
  fromEntityName: string; // Denormalized
  toEntityName: string; // Denormalized
}