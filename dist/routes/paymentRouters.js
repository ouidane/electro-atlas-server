"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const premissions_1 = require("../middleware/premissions");
const paymentController_1 = require("../controllers/paymentController");
const router = express_1.default.Router();
// Regular routes
router.post("/checkout", premissions_1.authenticateUser, paymentController_1.createStripeCheckout);
// Webhook route with raw body handling
router.post("/webhook", express_1.default.raw({ type: "application/json" }), paymentController_1.stripeWebhook);
exports.default = router;
//# sourceMappingURL=paymentRouters.js.map