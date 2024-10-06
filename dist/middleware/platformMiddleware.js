"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const constants_1 = require("../utils/constants");
dotenv_1.default.config();
const platformMiddleware = (req, res, next) => {
    const origin = req.headers.origin;
    // if (origin?.includes(process.env.MARKETPLACE_URL)) {
    //   req.platform = PLATFORM.MARKETPLACE;
    // } else if (origin?.includes(process.env.DELIVERY_URL)) {
    //   req.platform = PLATFORM.DELIVERY;
    // } else if (origin?.includes(process.env.VENDOR_URL)) {
    //   req.platform = PLATFORM.VENDOR;
    // } else {
    //   // Throw an error if the platform is unknown
    //   return next(createError(400, "Unknown platform"));
    // }
    req.platform = constants_1.PLATFORMS.MARKETPLACE;
    next();
};
exports.default = platformMiddleware;
//# sourceMappingURL=platformMiddleware.js.map