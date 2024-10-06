"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_session_1 = __importDefault(require("express-session"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const connectRedis_1 = __importDefault(require("../db/connectRedis"));
dotenv_1.default.config();
// Initialize session middleware
const redisStore = new connect_redis_1.default({
    client: connectRedis_1.default,
    prefix: "user-session:",
});
exports.default = (0, express_session_1.default)({
    store: redisStore,
    secret: process.env.SESSION_PRIVATE_KEY,
    saveUninitialized: false,
    resave: false,
    name: "sessionId",
    cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1000 * 60 * 30,
        sameSite: "lax",
    },
});
//# sourceMappingURL=session.js.map