"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const http_errors_1 = require("http-errors");
const errors_1 = require("../errors");
const logger_1 = require("../utils/logger");
const errorHandler = (err, req, res, next) => {
    logger_1.logger.error(`Error: ${err}`);
    if (err instanceof http_errors_1.HttpError) {
        return res.status(err.statusCode).json({ message: err.message });
    }
    if (err instanceof errors_1.ValidationError) {
        const errors = JSON.stringify(err.errors);
        return res.status(400).json({ message: err.message, errors });
    }
    if (err instanceof errors_1.StockUnavailableError) {
        return res
            .status(400)
            .json({ message: err.message, errors: JSON.stringify(err.errors) });
    }
    if (err instanceof mongoose_1.default.Error.ValidationError) {
        let errors = {};
        Object.values(err.errors).forEach((item) => {
            return (errors[item.path] = item.message);
        });
        return res
            .status(400)
            .json({ message: "Validation error", errors: JSON.stringify(errors) });
    }
    if (err instanceof mongoose_1.default.Error.CastError) {
        return res.status(400).json({
            message: "Cast Error",
            details: process.env.NODE_ENV === "production" ? undefined : err.stack,
        });
    }
    if (err.code === 11000) {
        const keyPattern = Object.keys(err.keyPattern);
        if (keyPattern.includes("productId") && keyPattern.includes("userId")) {
            return res
                .status(409)
                .json({ message: "User already reviews the product" });
        }
        if (keyPattern.includes("email") && keyPattern.includes("platform")) {
            return res.status(409).json({ message: "Email already exist" });
        }
        return res.status(409).json({
            message: "Duplicate Key Error, The Resource Already Exists",
            details: process.env.NODE_ENV === "production" ? undefined : err.stack,
        });
    }
    return res.status(500).json({
        message: "Internal Server Error",
        details: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
};
exports.default = errorHandler;
//# sourceMappingURL=errorHandler.js.map