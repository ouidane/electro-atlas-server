"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// Middleware to capture raw body for Stripe webhook
const rawBodyMiddleware = (req, res, next) => {
    if (req.url.startsWith("/api/v1/payment/webhook")) {
        next();
    }
    else {
        express_1.default.json()(req, res, next);
    }
};
exports.default = rawBodyMiddleware;
//# sourceMappingURL=rawBodyMiddleware.js.map