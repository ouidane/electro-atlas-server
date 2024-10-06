"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResetToken = generateResetToken;
exports.validateResetToken = validateResetToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const debug_1 = __importDefault(require("debug"));
dotenv_1.default.config();
const debugLogResetToken = (0, debug_1.default)("myapp:ResetToken");
const secretKey = process.env.PASSWORD_RESET_SECRET_KEY;
function generateResetToken(payload) {
    const options = { expiresIn: "15m" };
    const token = jsonwebtoken_1.default.sign(payload, secretKey, options);
    return token;
}
function validateResetToken(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secretKey);
        return decoded;
    }
    catch (err) {
        debugLogResetToken("Invalid or expired token");
        return null;
    }
}
//# sourceMappingURL=passwordResetToken.js.map