import { Types } from "mongoose";
import { CartItem, Order, Delivery, OrderItem, Payment } from "../models";
import { DELIVERY_STATUS, ORDER_STATUS, PAYMENT_METHOD } from "./constants";

async function createNewPayment(session: any, status: string) {
  const profile = JSON.parse(session.metadata.profile);

  const payment = await Payment.create({
    amountTotal: session.amount_total / 100,
    paymentStatus: status,
    paymentMethod: PAYMENT_METHOD.CARD,
    customerId: session.customer,
    userId: profile.userId,
    transactionId: session.payment_intent,
  });

  return payment._id;
}

async function createNewDelivery(session, orderId) {
  const profile = JSON.parse(session.metadata.profile);

  const delivery = await Delivery.create({
    orderId,
    deliveryStatus: DELIVERY_STATUS.PENDING,
    estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    userId: profile.userId,
    trackingNumber: "ORDER0000000000001",
    carrier: "FedEx",
    shippingAddress: {
      street: profile.address.line1,
      city: profile.address.city,
      country: profile.address.country,
      postalCode: profile.address.postalCode,
    },
  });

  return delivery;
}

async function createNewOrder(session: any, paymentId: unknown) {
  const profile = JSON.parse(session.metadata.profile);
  const cartId = session.metadata.cartId;

  const cartItems = await CartItem.getFormattedCartItems(cartId);
  if (!cartItems || cartItems.length === 0) throw new Error("Cart not found");

  const order = await Order.create({
    userId: profile.userId,
    paymentId: paymentId,
    totalAmount: session.amount_total / 100,
    orderStatus: ORDER_STATUS.CREATED,
  });

  const orderItems = cartItems.map((item) => {
    return {
      productId: item.productId,
      orderId: order._id,
      sellerId: item.sellerId,
      quantity: item.quantity,
      salePrice: item.variant.salePrice,
      totalPrice: item.totalPrice,
      productName: item.productName,
      sku: item.variant.sku,
      image: item.image,
    };
  });

  await OrderItem.insertMany(orderItems);

  return { ...order, orderItems };
}

async function updateOrderStatus(orderId: string, newStatus: string) {
  try {
    await Order.findByIdAndUpdate(orderId, { orderStatus: newStatus });
  } catch (error) {
    throw new Error("Failed to update order status");
  }
}

export {
  createNewOrder,
  createNewDelivery,
  createNewPayment,
  updateOrderStatus,
};
