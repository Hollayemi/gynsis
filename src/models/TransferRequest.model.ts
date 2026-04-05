import { Schema, model, models } from 'mongoose';
import { ITransferRequest, TransferStatus } from './types';

const TransferRequestSchema = new Schema<ITransferRequest>(
  {
    riderId: {
      type: Schema.Types.ObjectId,
      ref: 'Rider',
      required: true,
      index: true
    },
    fromUnionId: {
      type: Schema.Types.ObjectId,
      ref: 'Union',
      required: true,
      index: true
    },
    toUnionId: {
      type: Schema.Types.ObjectId,
      ref: 'Union',
      required: true,
      index: true
    },
    lgaId: {
      type: Schema.Types.ObjectId,
      ref: 'LGA',
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: Object.values(TransferStatus),
      default: TransferStatus.PENDING,
      index: true
    },
    clearanceCertificate: {
      type: String
    },
    requestDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    completionDate: {
      type: Date
    },
    gracePeriodEnd: {
      type: Date
    },
    rejectionReason: {
      type: String
    },
    riderCode: {
      type: String,
      required: true,
      index: true
    },
    fromUnionName: {
      type: String,
      required: true
    },
    toUnionName: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
    collection: 'transfer_requests'
  }
);

// Compound indexes
TransferRequestSchema.index({ riderId: 1, status: 1 });
TransferRequestSchema.index({ fromUnionId: 1, status: 1 });
TransferRequestSchema.index({ toUnionId: 1, status: 1 });
TransferRequestSchema.index({ requestDate: -1, status: 1 });

// Pre-save middleware to set grace period
TransferRequestSchema.pre('save', function(next) {
  if (this.isNew && this.status === TransferStatus.PENDING) {
    // Set grace period end to 30 days from now
    this.gracePeriodEnd = new Date();
    this.gracePeriodEnd.setDate(this.gracePeriodEnd.getDate() + 30);
  }
  next();
});

export const TransferRequestModel = models.TransferRequest || 
  model<ITransferRequest>('TransferRequest', TransferRequestSchema);