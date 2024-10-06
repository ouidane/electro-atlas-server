"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const custom_api_1 = __importDefault(require("./custom-api"));
class ValidationError extends custom_api_1.default {
    constructor(message, errors) {
        super(message);
        this.name = "ValidationError";
        this.errors = errors;
    }
}
exports.default = ValidationError;
//# sourceMappingURL=validation.js.map