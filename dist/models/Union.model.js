"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnionModel = void 0;
const mongoose_1 = require("mongoose");
const UnionSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    lgaId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
    collection: 'unions'
});
// Compound indexes
UnionSchema.index({ lgaId: 1, unionCode: 1 }, { unique: true });
UnionSchema.index({ lgaId: 1, unionName: 1 });
UnionSchema.index({ finalTicketPrice: 1 });
// Pre-save middleware to calculate final price
UnionSchema.pre('save', function (next) {
    if (this.isModified('govBasePrice') || this.isModified('unionLevy')) {
        this.finalTicketPrice = this.govBasePrice + this.unionLevy;
    }
    next();
});
exports.UnionModel = mongoose_1.models.Union || (0, mongoose_1.model)('Union', UnionSchema);
//# sourceMappingURL=Union.model.js.map