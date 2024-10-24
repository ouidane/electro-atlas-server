import debug from "debug";
import { PAYMENT_METHOD, PAYMENT_STATUS } from "../utils/constants";
import { inventoryService } from "./inventoryService";
import { orderService } from "./orderService";
import { deliveryService } from "./deliveryService";
import { cartService } from "./cartService";
import { emailService } from "./emailService";
import { userService } from "./userService";
import { Payment } from "../models";
import createError from "http-errors";
import Stripe from "stripe";
import { stripeService } from "./stripeService";

const debugLog = debug("myapp:PaymentService");

export class PaymentService {
  async createCheckoutSession(userId: string): Promise<string> {
    const user = await userService.getUserById(userId);
    if (!user.profile || !user.profile.address) {
      throw createError(404, "Profile not found");
    }

    const cart = await cartService.getCartByUserId(userId);
    await inventoryService.checkStock(cart.cartItems);

    const customer = await stripeService.createCustomer(user);
    const session = await stripeService.createCheckoutSession(
      user.profile,
      cart._id,
      customer,
      cart.cartItems
    );

    return session.url!;
  }

  async handleStripeEvent(event: Stripe.Event) {
    switch (event.type) {
      case "checkout.session.completed":
        await this.handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;
      // ... handle other event types
    }
  }

  async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    try {
      const email = session.customer_details!.email!;
      const cartId = session.metadata!.cartId;
      const profile = JSON.parse(session.metadata!.profile);

      const paymentId = await this.createPayment(
        session,
        PAYMENT_STATUS.COMPLETED
      );
      const order = await orderService.createOrder({ session, paymentId });
      const delivery = await deliveryService.createDelivery(profile, order._id);

      await Promise.all([
        cartService.clearCartById(cartId),
        inventoryService.updateInventory(order._id),
        emailService.sendOrderConfirmationEmail({
          order,
          delivery,
          email,
        }),
      ]);
    } catch (error) {
      debugLog("Error handling checkout session completion:", error);
    }
  }

  async createPayment(session: Stripe.Checkout.Session, status: string) {
    const payment = await Payment.create({
      amountTotal: session.amount_total! / 100,
      paymentStatus: status,
      paymentMethod: PAYMENT_METHOD.CARD,
      customerId: session.customer,
      userId: session.metadata!.userId,
      transactionId: session.payment_intent,
    });

    return payment._id;
  }
}

export const paymentService = new PaymentService();
