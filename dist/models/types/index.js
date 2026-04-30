"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityType = exports.SyncStatus = exports.PaymentMethod = exports.TransferStatus = exports.ComplianceStatus = exports.VehicleType = exports.UserRole = void 0;
// ─── Enums ────────────────────────────────────────────────────────────────────
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["GOVERNMENT"] = "government";
    UserRole["LGA"] = "lga";
    UserRole["UNION"] = "union";
    UserRole["SELLER"] = "seller";
    UserRole["RIDER"] = "rider";
})(UserRole || (exports.UserRole = UserRole = {}));
var VehicleType;
(function (VehicleType) {
    VehicleType["OKADA"] = "okada";
    VehicleType["TRICYCLE"] = "tricycle";
})(VehicleType || (exports.VehicleType = VehicleType = {}));
var ComplianceStatus;
(function (ComplianceStatus) {
    ComplianceStatus["COMPLIANT"] = "compliant";
    ComplianceStatus["WARNING"] = "warning";
    ComplianceStatus["VIOLATION"] = "violation";
})(ComplianceStatus || (exports.ComplianceStatus = ComplianceStatus = {}));
var TransferStatus;
(function (TransferStatus) {
    TransferStatus["NONE"] = "none";
    TransferStatus["PENDING"] = "pending";
    TransferStatus["CLEARANCE_CHECK"] = "clearance_check";
    TransferStatus["APPROVED_BY_UNION_A"] = "approved_by_union_a";
    TransferStatus["APPROVED_BY_UNION_B"] = "approved_by_union_b";
    TransferStatus["LGA_APPROVED"] = "lga_approved";
    TransferStatus["COMPLETED"] = "completed";
    TransferStatus["REJECTED"] = "rejected";
})(TransferStatus || (exports.TransferStatus = TransferStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "cash";
    PaymentMethod["WALLET"] = "wallet";
    PaymentMethod["TRANSFER"] = "transfer";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var SyncStatus;
(function (SyncStatus) {
    SyncStatus["PENDING_SYNC"] = "pending_sync";
    SyncStatus["SYNCED"] = "synced";
})(SyncStatus || (exports.SyncStatus = SyncStatus = {}));
var EntityType;
(function (EntityType) {
    EntityType["UNION"] = "union";
    EntityType["LGA"] = "lga";
})(EntityType || (exports.EntityType = EntityType = {}));
//# sourceMappingURL=index.js.map