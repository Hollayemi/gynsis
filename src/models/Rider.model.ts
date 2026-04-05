import { Schema, model, models } from 'mongoose';
import { IRider, VehicleType, ComplianceStatus, TransferStatus } from './types';

const RiderSchema = new Schema<IRider>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    riderCode: {
      type: String,
      required: [true, 'Rider code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    unionId: {
      type: Schema.Types.ObjectId,
      ref: 'Union',
      required: true,
      index: true
    },
    originalUnionId: {
      type: Schema.Types.ObjectId,
      ref: 'Union',
      required: true,
      index: true
    },
    vehicleType: {
      type: String,
      enum: Object.values(VehicleType),
      required: [true, 'Vehicle type is required']
    },
    vehicleNumber: {
      type: String,
      required: [true, 'Vehicle number is required'],
      uppercase: true,
      trim: true,
      index: true
    },
    complianceStatus: {
      type: String,
      enum: Object.values(ComplianceStatus),
      default: ComplianceStatus.COMPLIANT,
      index: true
    },
    lastPaymentDate: {
      type: Date
    },
    outstandingBalance: {
      type: Number,
      default: 0,
      min: 0
    },
    transferStatus: {
      type: String,
      enum: Object.values(TransferStatus),
      default: TransferStatus.NONE,
      index: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      index: true
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    }
  },
  {
    timestamps: true,
    collection: 'riders'
  }
);

// Compound indexes for common queries
RiderSchema.index({ unionId: 1, complianceStatus: 1 });
RiderSchema.index({ unionId: 1, transferStatus: 1 });
RiderSchema.index({ riderCode: 1, unionId: 1 });

export const RiderModel = models.Rider || model<IRider>('Rider', RiderSchema);