import dotenv from "dotenv";
dotenv.config();
import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { Cart, CartItem, Profile } from "../models";
import {
  createCheckoutSession,
  createStripeCustomer,
  stripeEvent,
} from "../utils/stripe";
import { handleCheckoutSessionCompleted } from "../utils/stripeCheckoutHandlers";
import { checkStock } from "../utils/handlers";
import StockUnavailableError from "../errors/stock-unavailable";

// CREATE CHECKOUT =========================================================
const createStripeCheckout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user.id;

  const profile = await Profile.findOne({ userId })
    .select("familyName givenName userId address phone")
    .lean();
  if (!profile || !profile.address) {
    return next(createError(404, "Profile not found"));
  }

  const cart = await Cart.findOne({ userId });
  const cartItems = await CartItem.getFormattedCartItems(cart!._id);
  if (!cartItems || cartItems.length === 0) {
    return next(createError(404, "Cart is empty"));
  }

  const stockCheck = await checkStock(cartItems);
  if (!stockCheck.isAvailable) {
    throw new StockUnavailableError(
      "Some items are out of stock",
      stockCheck.unavailableItems
    );
  }

  const customer = await createStripeCustomer(userId);
  const session = await createCheckoutSession(
    profile,
    customer,
    cart!._id,
    cartItems
  );

  res.status(200).json({ url: session.url });
};

// stripe Webhook =========================================================
const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;

  try {
    const event = stripeEvent(req.body, sig);

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      // ... handle other event types
    }

    res.json({ received: true });
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

export { createStripeCheckout, stripeWebhook };
