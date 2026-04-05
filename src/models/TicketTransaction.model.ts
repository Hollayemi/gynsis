import { Schema, model, models } from 'mongoose';
import { ITicketTransaction, PaymentMethod, SyncStatus } from './types';

const TicketTransactionSchema = new Schema<ITicketTransaction>(
  {
    riderId: {
      type: Schema.Types.ObjectId,
      ref: 'Rider',
      required: true,
      index: true
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
      index: true
    },
    unionId: {
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
    amountPaid: {
      type: Number,
      required: true,
      min: 0
    },
    govPortion: {
      type: Number,
      required: true,
      min: 0
    },
    unionPortion: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    gpsLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true,
        index: '2dsphere'
      }
    },
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    syncStatus: {
      type: String,
      enum: Object.values(SyncStatus),
      default: SyncStatus.PENDING_SYNC,
      index: true
    },
    riderCode: {
      type: String,
      required: true,
      index: true
    },
    unionCode: {
      type: String,
      required: true,
      index: true
    }
  },
  {
    timestamps: true,
    collection: 'ticket_transactions'
  }
);

// Compound indexes for reporting
TicketTransactionSchema.index({ paymentDate: -1, unionId: 1 });
TicketTransactionSchema.index({ paymentDate: -1, lgaId: 1 });
TicketTransactionSchema.index({ syncStatus: 1, createdAt: 1 });
TicketTransactionSchema.index({ riderId: 1, paymentDate: -1 });

// Create 2dsphere index for geospatial queries
TicketTransactionSchema.index({ gpsLocation: '2dsphere' });

export const TicketTransactionModel = models.TicketTransaction || 
  model<ITicketTransaction>('TicketTransaction', TicketTransactionSchema);