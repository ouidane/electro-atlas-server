"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhook = exports.createStripeCheckout = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const http_errors_1 = __importDefault(require("http-errors"));
const models_1 = require("../models");
const stripe_1 = require("../utils/stripe");
const stripeCheckoutHandlers_1 = require("../utils/stripeCheckoutHandlers");
const handlers_1 = require("../utils/handlers");
const stock_unavailable_1 = __importDefault(require("../errors/stock-unavailable"));
// CREATE CHECKOUT =========================================================
const createStripeCheckout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const profile = yield models_1.Profile.findOne({ userId })
        .select("familyName givenName userId address phone")
        .lean();
    if (!profile || !profile.address) {
        return next((0, http_errors_1.default)(404, "Profile not found"));
    }
    const cart = yield models_1.Cart.findOne({ userId });
    const cartItems = yield models_1.CartItem.getFormattedCartItems(cart._id);
    if (!cartItems || cartItems.length === 0) {
        return next((0, http_errors_1.default)(404, "Cart is empty"));
    }
    const stockCheck = yield (0, handlers_1.checkStock)(cartItems);
    if (!stockCheck.isAvailable) {
        throw new stock_unavailable_1.default("Some items are out of stock", stockCheck.unavailableItems);
    }
    const customer = yield (0, stripe_1.createStripeCustomer)(userId);
    const session = yield (0, stripe_1.createCheckoutSession)(profile, customer, cart._id, cartItems);
    res.status(200).json({ url: session.url });
});
exports.createStripeCheckout = createStripeCheckout;
// stripe Webhook =========================================================
const stripeWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sig = req.headers["stripe-signature"];
    try {
        const event = (0, stripe_1.stripeEvent)(req.body, sig);
        switch (event.type) {
            case "checkout.session.completed":
                yield (0, stripeCheckoutHandlers_1.handleCheckoutSessionCompleted)(event.data.object);
                break;
            // ... handle other event types
        }
        res.json({ received: true });
    }
    catch (error) {
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }
});
exports.stripeWebhook = stripeWebhook;
//# sourceMappingURL=paymentController.js.map