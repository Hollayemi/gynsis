"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellerModel = void 0;
const mongoose_1 = require("mongoose");
const SellerSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    unionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Union',
        required: true,
        index: true
    },
    ticketAllocation: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    ticketsSoldToday: {
        type: Number,
        default: 0,
        min: 0
    },
    totalTicketsSold: {
        type: Number,
        default: 0,
        min: 0
    },
    lastSyncTime: {
        type: Date
    }
}, {
    timestamps: true,
    collection: 'sellers'
});
// Compound indexes
SellerSchema.index({ unionId: 1, ticketsSoldToday: -1 });
SellerSchema.index({ unionId: 1, totalTicketsSold: -1 });
// Method to reset daily sales (could be called by cron job)
SellerSchema.methods.resetDailySales = function () {
    this.ticketsSoldToday = 0;
    return this.save();
};
exports.SellerModel = mongoose_1.models.Seller || (0, mongoose_1.model)('Seller', SellerSchema);
//# sourceMappingURL=Seller.model.js.map