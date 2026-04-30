"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const types_1 = require("./types");
const UserSchema = new mongoose_1.Schema({
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        index: true,
        trim: true
    },
    role: {
        type: String,
        enum: Object.values(types_1.UserRole),
        required: [true, 'Role is required'],
        index: true
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true,
    collection: 'users'
});
// Compound indexes for common queries
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ phone: 1, role: 1 });
exports.UserModel = mongoose_1.models.User || (0, mongoose_1.model)('User', UserSchema);
//# sourceMappingURL=User.model.js.map