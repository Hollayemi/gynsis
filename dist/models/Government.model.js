"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GovernmentModel = void 0;
const mongoose_1 = require("mongoose");
const GovernmentSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
    collection: 'governments'
});
GovernmentSchema.index({ stateName: 1 });
GovernmentSchema.index({ totalRevenueCollected: -1 });
exports.GovernmentModel = mongoose_1.models.Government || (0, mongoose_1.model)('Government', GovernmentSchema);
//# sourceMappingURL=Government.model.js.map