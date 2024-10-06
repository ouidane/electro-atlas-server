import debug from "debug";
import { PAYMENT_STATUS } from "../utils/constants";
import { updateInventory } from "./handlers";
import {
  createNewDelivery,
  createNewOrder,
  createNewPayment,
} from "./orderHandlers";
import { CartItem, Cart, Order } from "../models";
import sendOrderConfirmationEmail from "./sendOrderConfirmationEmail";

const debugLogStripe = debug("myapp:Stripe");

async function handleCheckoutSessionCompleted(session: any) {
  try {
    const cartId = session.metadata.cartId;
    const email = session.customer_details.email;
    const origin = process.env.MARKETPLACE_URL as string;

    const paymentId = await createNewPayment(session, PAYMENT_STATUS.COMPLETED);
    const order = await createNewOrder(session, paymentId);
    const delivery = await createNewDelivery(session, order._id);

    await Promise.all([
      updateInventory(order._id),
      sendOrderConfirmationEmail({ order, delivery, email, origin }),
      Order.updateOrderById(order._id),
      CartItem.deleteMany({ cartId }),
    ]);

    await Cart.updateCart(cartId);
  } catch (error) {
    debugLogStripe("Error handling checkout session completion:", error);
  }
}

export { handleCheckoutSessionCompleted };
