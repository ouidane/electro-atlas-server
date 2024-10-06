"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEmailVerificationToken = generateEmailVerificationToken;
exports.validateEmailVerificationToken = validateEmailVerificationToken;
exports.generateVerificationCode = generateVerificationCode;
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const debug_1 = __importDefault(require("debug"));
dotenv_1.default.config();
const debugLogVerificationToken = (0, debug_1.default)("myapp:VerificationToken");
const secretKey = process.env.EMAIL_VERIFICATION_SECRET_KEY;
function generateEmailVerificationToken(verificationCode, email) {
    const payload = {
        verificationCode,
        email,
        createdAt: Date.now(),
    };
    const options = { expiresIn: "10m" };
    const token = jsonwebtoken_1.default.sign(payload, secretKey, options);
    return token;
}
function validateEmailVerificationToken(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secretKey);
        return decoded;
    }
    catch (err) {
        debugLogVerificationToken("Invalid or expired token");
        return null;
    }
}
function generateVerificationCode() {
    let code = "";
    for (let i = 0; i < 6; i++) {
        const digit = Math.floor(Math.random() * 10);
        code += digit;
    }
    return code;
}
//# sourceMappingURL=emailVerificationToken.js.map