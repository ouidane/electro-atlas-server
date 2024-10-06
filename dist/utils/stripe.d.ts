import stripe, { Stripe } from "stripe";
import { type FormattedItem } from "../@types/types";
declare const createStripeCustomer: (userId: string) => Promise<stripe.Customer>;
declare const createCheckoutSession: (profile: any, customer: stripe.Customer, cartId: unknown, items: FormattedItem[]) => Promise<stripe.Response<stripe.Checkout.Session>>;
declare const stripeEvent: (rawBody: string | Buffer, sig: string | string[]) => stripe.Event;
declare function getLineItemsFromSession(session: Stripe.Checkout.Session): Promise<stripe.LineItem[]>;
export { createStripeCustomer, createCheckoutSession, stripeEvent, getLineItemsFromSession, };
