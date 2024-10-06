"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const constants_1 = require("./constants");
dotenv_1.default.config();
const whitelist = Object.values(constants_1.platformMap);
const corsOptions = {
    optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
    origin: function (origin, callback) {
        if (!origin || whitelist.includes(origin)) {
            callback(null, true); // Allow requests with no origin (like mobile apps, curl requests, etc.) or if origin is whitelisted
        }
        else {
            const error = new Error("Not allowed by CORS");
            error.name = "CorsError";
            callback(error, false);
        }
    },
    credentials: true, // Allow cookies and other credentials to be sent
};
exports.default = corsOptions;
//# sourceMappingURL=cors.js.map