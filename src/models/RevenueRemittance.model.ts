import { Schema, model, models } from 'mongoose';
import { IRevenueRemittance, EntityType } from './types';

const RevenueRemittanceSchema = new Schema<IRevenueRemittance>(
  {
    fromEntityType: {
      type: String,
      enum: Object.values(EntityType),
      required: true,
      index: true
    },
    fromEntityId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true
    },
    toEntityType: {
      type: String,
      enum: Object.values(EntityType),
      required: true,
      index: true
    },
    toEntityId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentReference: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    remittanceDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    ticketTransactionsIncluded: [{
      type: Schema.Types.ObjectId,
      ref: 'TicketTransaction'
    }],
    fromEntityName: {
      type: String,
      required: true
    },
    toEntityName: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
    collection: 'revenue_remittances'
  }
);

// Compound indexes for reporting
RevenueRemittanceSchema.index({ remittanceDate: -1, fromEntityType: 1, fromEntityId: 1 });
RevenueRemittanceSchema.index({ remittanceDate: -1, toEntityType: 1, toEntityId: 1 });
RevenueRemittanceSchema.index({ fromEntityId: 1, remittanceDate: -1 });
RevenueRemittanceSchema.index({ toEntityId: 1, remittanceDate: -1 });

export const RevenueRemittanceModel = models.RevenueRemittance || 
  model<IRevenueRemittance>('RevenueRemittance', RevenueRemittanceSchema);