"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevenueRemittanceModel = void 0;
const mongoose_1 = require("mongoose");
const types_1 = require("./types");
const RevenueRemittanceSchema = new mongoose_1.Schema({
    fromEntityType: {
        type: String,
        enum: Object.values(types_1.EntityType),
        required: true,
        index: true
    },
    fromEntityId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    toEntityType: {
        type: String,
        enum: Object.values(types_1.EntityType),
        required: true,
        index: true
    },
    toEntityId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
            type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
    collection: 'revenue_remittances'
});
// Compound indexes for reporting
RevenueRemittanceSchema.index({ remittanceDate: -1, fromEntityType: 1, fromEntityId: 1 });
RevenueRemittanceSchema.index({ remittanceDate: -1, toEntityType: 1, toEntityId: 1 });
RevenueRemittanceSchema.index({ fromEntityId: 1, remittanceDate: -1 });
RevenueRemittanceSchema.index({ toEntityId: 1, remittanceDate: -1 });
exports.RevenueRemittanceModel = mongoose_1.models.RevenueRemittance ||
    (0, mongoose_1.model)('RevenueRemittance', RevenueRemittanceSchema);
//# sourceMappingURL=RevenueRemittance.model.js.map