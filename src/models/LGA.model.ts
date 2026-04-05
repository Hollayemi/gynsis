import { Schema, model, models } from 'mongoose';
import { ILGA } from './types';

const LGASchema = new Schema<ILGA>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    govId: {
      type: Schema.Types.ObjectId,
      ref: 'Government',
      required: true,
      index: true
    },
    lgaName: {
      type: String,
      required: [true, 'LGA name is required'],
      trim: true,
      index: true
    },
    ticketQuota: {
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
    expectedRevenue: {
      type: Number,
      default: 0,
      min: 0
    },
    actualRevenue: {
      type: Number,
      default: 0,
      min: 0
    },
    complianceRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  {
    timestamps: true,
    collection: 'lgas'
  }
);

// Compound indexes
LGASchema.index({ govId: 1, lgaName: 1 }, { unique: true });
LGASchema.index({ complianceRate: -1 });
LGASchema.index({ govId: 1, complianceRate: -1 });

// Pre-save middleware to calculate expected revenue
LGASchema.pre('save', function(next) {
  // This would need a reference to govBasePrice
  // You might want to calculate this in a service instead
  next();
});

export const LGAModel = models.LGA || model<ILGA>('LGA', LGASchema);