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
exports.stripeEvent = exports.createCheckoutSession = exports.createStripeCustomer = void 0;
exports.getLineItemsFromSession = getLineItemsFromSession;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const stripe_1 = __importDefault(require("stripe"));
const models_1 = require("../models");
const debug_1 = __importDefault(require("debug"));
const debugLogStripe = (0, debug_1.default)("myapp:Stripe");
const stripeSecretKey = process.env.STRIPE_KEY;
const stripeWebhookSecret = process.env.STRIPE_ENDPOINT_SECRET;
const stripeClient = new stripe_1.default(stripeSecretKey);
// Function to create a customer in Stripe
const createStripeCustomer = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch the user to get their Stripe customerId
        const user = yield models_1.User.findById(userId).lean();
        if (!user || !user.isVerified) {
            throw new Error("User not found or is not verified");
        }
        // Check if customer exists, create if not
        let customer = yield stripeClient.customers
            .list({ email: user.email })
            .then((list) => list.data[0]);
        if (!customer) {
            customer = yield stripeClient.customers.create({
                email: user.email,
                metadata: { userId: user._id.toString() },
            });
        }
        return customer;
    }
    catch (error) {
        debugLogStripe("Error creating stripe customer:", error);
        throw new Error("Error creating stripe customer");
    }
});
exports.createStripeCustomer = createStripeCustomer;
// Function to create a checkout session in Stripe
const createCheckoutSession = (profile, customer, cartId, items) => __awaiter(void 0, void 0, void 0, function* () {
    const lineItems = items.map((item) => ({
        price_data: {
            currency: "mad",
            product_data: {
                name: item.productName,
                images: item.image ? [item.image] : [],
                metadata: {
                    id: item.productId.toString(),
                },
            },
            unit_amount: Math.round(item.variant.salePrice * 100),
        },
        quantity: item.quantity,
    }));
    try {
        const session = yield stripeClient.checkout.sessions.create({
            payment_method_types: ["card"],
            customer: customer.id,
            line_items: lineItems,
            mode: "payment",
            metadata: {
                profile: JSON.stringify(profile),
                cartId: cartId.toString(),
            },
            success_url: `${process.env.MARKETPLACE_URL}/success-payment`,
            cancel_url: `${process.env.MARKETPLACE_URL}/canceled-payment`,
        });
        return session;
    }
    catch (error) {
        debugLogStripe("Error creating checkout session:", error);
        throw new Error("Error creating checkout session");
    }
});
exports.createCheckoutSession = createCheckoutSession;
// Function to construct an event webhook
const stripeEvent = (rawBody, sig) => {
    try {
        const event = stripeClient.webhooks.constructEvent(rawBody, sig, stripeWebhookSecret);
        return event;
    }
    catch (error) {
        debugLogStripe("Error constructing event:", error);
        throw new Error("Error constructing event");
    }
};
exports.stripeEvent = stripeEvent;
function getLineItemsFromSession(session) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!session || !session.id) {
            throw new Error("Invalid session provided");
        }
        try {
            const lineItems = yield stripeClient.checkout.sessions.listLineItems(session.id);
            return lineItems.data;
        }
        catch (error) {
            debugLogStripe("Error fetching line items:", error);
            throw new Error("Error fetching line items");
        }
    });
}
//# sourceMappingURL=stripe.js.map