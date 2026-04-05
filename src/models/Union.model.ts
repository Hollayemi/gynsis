import { Schema, model, models } from 'mongoose';
import { IUnion } from './types';

const UnionSchema = new Schema<IUnion>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    lgaId: {
      type: Schema.Types.ObjectId,
      ref: 'LGA',
      required: true,
      index: true
    },
    unionCode: {
      type: String,
      required: [true, 'Union code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 4,
      maxlength: 4,
      index: true
    },
    unionName: {
      type: String,
      required: [true, 'Union name is required'],
      trim: true,
      index: true
    },
    govBasePrice: {
      type: Number,
      required: true,
      min: 0,
      default: 100
    },
    unionLevy: {
      type: Number,
      required: true,
      min: 0,
      default: 100
    },
    finalTicketPrice: {
      type: Number,
      required: true,
      min: 0
    },
    ticketAllocation: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    ticketsSold: {
      type: Number,
      default: 0,
      min: 0
    },
    govWalletBalance: {
      type: Number,
      default: 0,
      min: 0
    },
    unionWalletBalance: {
      type: Number,
      default: 0,
      min: 0
    },
    lastRemittanceDate: {
      type: Date
    }
  },
  {
    timestamps: true,
    collection: 'unions'
  }
);

// Compound indexes
UnionSchema.index({ lgaId: 1, unionCode: 1 }, { unique: true });
UnionSchema.index({ lgaId: 1, unionName: 1 });
UnionSchema.index({ finalTicketPrice: 1 });

// Pre-save middleware to calculate final price
UnionSchema.pre('save', function(next) {
  if (this.isModified('govBasePrice') || this.isModified('unionLevy')) {
    this.finalTicketPrice = this.govBasePrice + this.unionLevy;
  }
  next();
});

export const UnionModel = models.Union || model<IUnion>('Union', UnionSchema);