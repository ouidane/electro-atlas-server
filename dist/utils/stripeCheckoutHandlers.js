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
exports.handleCheckoutSessionCompleted = handleCheckoutSessionCompleted;
const debug_1 = __importDefault(require("debug"));
const constants_1 = require("../utils/constants");
const handlers_1 = require("./handlers");
const orderHandlers_1 = require("./orderHandlers");
const models_1 = require("../models");
const sendOrderConfirmationEmail_1 = __importDefault(require("./sendOrderConfirmationEmail"));
const debugLogStripe = (0, debug_1.default)("myapp:Stripe");
function handleCheckoutSessionCompleted(session) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const cartId = session.metadata.cartId;
            const email = session.customer_details.email;
            const origin = process.env.MARKETPLACE_URL;
            const paymentId = yield (0, orderHandlers_1.createNewPayment)(session, constants_1.PAYMENT_STATUS.COMPLETED);
            const order = yield (0, orderHandlers_1.createNewOrder)(session, paymentId);
            const delivery = yield (0, orderHandlers_1.createNewDelivery)(session, order._id);
            yield Promise.all([
                (0, handlers_1.updateInventory)(order._id),
                (0, sendOrderConfirmationEmail_1.default)({ order, delivery, email, origin }),
                models_1.Order.updateOrderById(order._id),
                models_1.CartItem.deleteMany({ cartId }),
            ]);
            yield models_1.Cart.updateCart(cartId);
        }
        catch (error) {
            debugLogStripe("Error handling checkout session completion:", error);
        }
    });
}
//# sourceMappingURL=stripeCheckoutHandlers.js.map