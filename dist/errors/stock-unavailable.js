"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const custom_api_1 = __importDefault(require("./custom-api"));
class StockUnavailableError extends custom_api_1.default {
    constructor(message, unavailableItems) {
        super(message);
        this.name = "StockUnavailableError";
        this.errors = unavailableItems;
    }
}
exports.default = StockUnavailableError;
//# sourceMappingURL=stock-unavailable.js.map