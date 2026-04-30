"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpModel = exports.SellerModel = exports.RiderModel = exports.UnionModel = exports.LGAModel = exports.GovernmentModel = exports.UserModel = void 0;
var User_model_1 = require("./User.model");
Object.defineProperty(exports, "UserModel", { enumerable: true, get: function () { return User_model_1.UserModel; } });
var Government_model_1 = require("./Government.model");
Object.defineProperty(exports, "GovernmentModel", { enumerable: true, get: function () { return Government_model_1.GovernmentModel; } });
var LGA_model_1 = require("./LGA.model");
Object.defineProperty(exports, "LGAModel", { enumerable: true, get: function () { return LGA_model_1.LGAModel; } });
var Union_model_1 = require("./Union.model");
Object.defineProperty(exports, "UnionModel", { enumerable: true, get: function () { return Union_model_1.UnionModel; } });
var Rider_model_1 = require("./Rider.model");
Object.defineProperty(exports, "RiderModel", { enumerable: true, get: function () { return Rider_model_1.RiderModel; } });
var Seller_model_1 = require("./Seller.model");
Object.defineProperty(exports, "SellerModel", { enumerable: true, get: function () { return Seller_model_1.SellerModel; } });
var Otp_model_1 = require("./Otp.model");
Object.defineProperty(exports, "OtpModel", { enumerable: true, get: function () { return Otp_model_1.OtpModel; } });
__exportStar(require("./types"), exports);
//# sourceMappingURL=index.js.map