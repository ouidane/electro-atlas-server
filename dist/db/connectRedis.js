"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const redis_1 = require("redis");
const logger_1 = require("../utils/logger");
dotenv_1.default.config();
const client = (0, redis_1.createClient)({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        connectTimeout: 50000,
    },
});
client.on("error", (err) => logger_1.logger.error(`Redis Client Error: ${err.message}`));
client.connect();
exports.default = client;
//# sourceMappingURL=connectRedis.js.map