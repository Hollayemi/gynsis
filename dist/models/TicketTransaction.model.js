"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketTransactionModel = void 0;
const mongoose_1 = require("mongoose");
const types_1 = require("./types");
const TicketTransactionSchema = new mongoose_1.Schema({
    riderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Rider',
        required: true,
        index: true
    },
    sellerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true,
        index: true
    },
    unionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Union',
        required: true,
        index: true
    },
    lgaId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        enum: Object.values(types_1.PaymentMethod),
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
        enum: Object.values(types_1.SyncStatus),
        default: types_1.SyncStatus.PENDING_SYNC,
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
}, {
    timestamps: true,
    collection: 'ticket_transactions'
});
// Compound indexes for reporting
TicketTransactionSchema.index({ paymentDate: -1, unionId: 1 });
TicketTransactionSchema.index({ paymentDate: -1, lgaId: 1 });
TicketTransactionSchema.index({ syncStatus: 1, createdAt: 1 });
TicketTransactionSchema.index({ riderId: 1, paymentDate: -1 });
// Create 2dsphere index for geospatial queries
TicketTransactionSchema.index({ gpsLocation: '2dsphere' });
exports.TicketTransactionModel = mongoose_1.models.TicketTransaction ||
    (0, mongoose_1.model)('TicketTransaction', TicketTransactionSchema);
//# sourceMappingURL=TicketTransaction.model.js.map