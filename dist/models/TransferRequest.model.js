"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferRequestModel = void 0;
const mongoose_1 = require("mongoose");
const types_1 = require("./types");
const TransferRequestSchema = new mongoose_1.Schema({
    riderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Rider',
        required: true,
        index: true
    },
    fromUnionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Union',
        required: true,
        index: true
    },
    toUnionId: {
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
    status: {
        type: String,
        enum: Object.values(types_1.TransferStatus),
        default: types_1.TransferStatus.PENDING,
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
}, {
    timestamps: true,
    collection: 'transfer_requests'
});
// Compound indexes
TransferRequestSchema.index({ riderId: 1, status: 1 });
TransferRequestSchema.index({ fromUnionId: 1, status: 1 });
TransferRequestSchema.index({ toUnionId: 1, status: 1 });
TransferRequestSchema.index({ requestDate: -1, status: 1 });
// Pre-save middleware to set grace period
TransferRequestSchema.pre('save', function (next) {
    if (this.isNew && this.status === types_1.TransferStatus.PENDING) {
        // Set grace period end to 30 days from now
        this.gracePeriodEnd = new Date();
        this.gracePeriodEnd.setDate(this.gracePeriodEnd.getDate() + 30);
    }
    next();
});
exports.TransferRequestModel = mongoose_1.models.TransferRequest ||
    (0, mongoose_1.model)('TransferRequest', TransferRequestSchema);
//# sourceMappingURL=TransferRequest.model.js.map