"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.morganMiddleware = exports.logger = void 0;
const winston_1 = require("winston");
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
// Create a Winston logger
const logger = (0, winston_1.createLogger)({
    level: "info",
    format: winston_1.format.combine(winston_1.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.format.printf((info) => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`)),
    transports: [
        new winston_1.transports.Console({
            format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.simple()),
        }),
        new winston_1.transports.File({
            filename: path_1.default.join(__dirname, "../../logs/error.log"),
            level: "error",
        }),
        new winston_1.transports.File({
            filename: path_1.default.join(__dirname, "../../logs/combined.log"),
        }),
    ],
});
exports.logger = logger;
// Morgan stream configuration to use Winston's logger
const stream = {
    write: (message) => logger.info(message.trim()),
};
// Morgan middleware for HTTP request logging
const morganMiddleware = (0, morgan_1.default)("combined", { stream });
exports.morganMiddleware = morganMiddleware;
//# sourceMappingURL=logger.js.map