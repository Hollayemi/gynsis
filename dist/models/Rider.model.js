"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiderModel = void 0;
const mongoose_1 = require("mongoose");
const types_1 = require("./types");
const RiderSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Union',
        required: true,
        index: true
    },
    originalUnionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Union',
        required: true,
        index: true
    },
    vehicleType: {
        type: String,
        enum: Object.values(types_1.VehicleType),
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
        enum: Object.values(types_1.ComplianceStatus),
        default: types_1.ComplianceStatus.COMPLIANT,
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
        enum: Object.values(types_1.TransferStatus),
        default: types_1.TransferStatus.NONE,
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
}, {
    timestamps: true,
    collection: 'riders'
});
// Compound indexes for common queries
RiderSchema.index({ unionId: 1, complianceStatus: 1 });
RiderSchema.index({ unionId: 1, transferStatus: 1 });
RiderSchema.index({ riderCode: 1, unionId: 1 });
exports.RiderModel = mongoose_1.models.Rider || (0, mongoose_1.model)('Rider', RiderSchema);
//# sourceMappingURL=Rider.model.js.map