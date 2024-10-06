import dotenv from "dotenv";
dotenv.config();
import stripe, { Stripe } from "stripe";
import { User } from "../models";
import { type FormattedItem } from "../@types/types";
import debug from "debug";

const debugLogStripe = debug("myapp:Stripe");

const stripeSecretKey = process.env.STRIPE_KEY as string;
const stripeWebhookSecret = process.env.STRIPE_ENDPOINT_SECRET as string;
const stripeClient = new stripe(stripeSecretKey);

// Function to create a customer in Stripe
const createStripeCustomer = async (userId: string) => {
  try {
    // Fetch the user to get their Stripe customerId
    const user = await User.findById(userId).lean();
    if (!user || !user.isVerified) {
      throw new Error("User not found or is not verified");
    }

    // Check if customer exists, create if not
    let customer = await stripeClient.customers
      .list({ email: user.email })
      .then((list) => list.data[0]);

    if (!customer) {
      customer = await stripeClient.customers.create({
        email: user.email,
        metadata: { userId: user._id.toString() },
      });
    }

    return customer;
  } catch (error) {
    debugLogStripe("Error creating stripe customer:", error);
    throw new Error("Error creating stripe customer");
  }
};

// Function to create a checkout session in Stripe
const createCheckoutSession = async (
  profile: any,
  customer: stripe.Customer,
  cartId: unknown,
  items: FormattedItem[]
) => {
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
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ["card"],
      customer: customer.id,
      line_items: lineItems,
      mode: "payment",
      metadata: {
        profile: JSON.stringify(profile),
        cartId: (cartId as any).toString(),
      },
      success_url: `${process.env.MARKETPLACE_URL}/success-payment`,
      cancel_url: `${process.env.MARKETPLACE_URL}/canceled-payment`,
    });

    return session;
  } catch (error) {
    debugLogStripe("Error creating checkout session:", error);
    throw new Error("Error creating checkout session");
  }
};

// Function to construct an event webhook
const stripeEvent = (rawBody: string | Buffer, sig: string | string[]) => {
  try {
    const event = stripeClient.webhooks.constructEvent(
      rawBody,
      sig,
      stripeWebhookSecret
    );

    return event;
  } catch (error) {
    debugLogStripe("Error constructing event:", error);
    throw new Error("Error constructing event");
  }
};

async function getLineItemsFromSession(session: Stripe.Checkout.Session) {
  if (!session || !session.id) {
    throw new Error("Invalid session provided");
  }

  try {
    const lineItems = await stripeClient.checkout.sessions.listLineItems(
      session.id
    );
    return lineItems.data;
  } catch (error) {
    debugLogStripe("Error fetching line items:", error);
    throw new Error("Error fetching line items");
  }
}

export {
  createStripeCustomer,
  createCheckoutSession,
  stripeEvent,
  getLineItemsFromSession,
};
