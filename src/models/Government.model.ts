import { Schema, model, models } from 'mongoose';
import { IGovernment } from './types';

const GovernmentSchema = new Schema<IGovernment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    stateName: {
      type: String,
      required: [true, 'State name is required'],
      trim: true,
      index: true
    },
    totalTicketsAllocated: {
      type: Number,
      default: 0,
      min: 0
    },
    totalRevenueCollected: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true,
    collection: 'governments'
  }
);

GovernmentSchema.index({ stateName: 1 });
GovernmentSchema.index({ totalRevenueCollected: -1 });

export const GovernmentModel = models.Government || model<IGovernment>('Government', GovernmentSchema);