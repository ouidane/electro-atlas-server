import dotenv from "dotenv";
import stripe from "stripe";

dotenv.config();
const stripeSecretKey = process.env.STRIPE_KEY as string;
export const stripeWebhookSecret = process.env.STRIPE_ENDPOINT_SECRET as string;

export const stripeClient = new stripe(stripeSecretKey);
