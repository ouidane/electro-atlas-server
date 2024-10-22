import Stripe from "stripe";
import { type FormattedItem } from "../types/types";
import { stripeClient, stripeWebhookSecret } from "../lib/stripe";


export class StripeService {
  async createCustomer(user: any): Promise<Stripe.Customer> {
    try {
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
      throw new Error("Error creating stripe customer");
    }
  }

  async createCheckoutSession(
    profile: any,
    cartId: any,
    customer: Stripe.Customer,
    items: FormattedItem[]
  ): Promise<Stripe.Checkout.Session> {
    try {
      const lineItems = this.createLineItems(items);
      const metadata = this.createSessionMetadata(profile, cartId);
      const sessionOptions = this.createSessionOptions(customer.id, lineItems, metadata);

      const session = await stripeClient.checkout.sessions.create(sessionOptions);
      return session;
    } catch (error) {
      throw new Error("Error creating checkout session");
    }
  }

  private createLineItems(items: FormattedItem[]): Stripe.Checkout.SessionCreateParams.LineItem[] {
    return items.map((item) => ({
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
  }

  private createSessionMetadata(profile: any, cartId: any): { [key: string]: string } {
    return {
      profile: JSON.stringify(profile),
      cartId: cartId.toString(),
      userId: profile.userId.toString(),
    };
  }

  private createSessionOptions(
    customerId: string,
    lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
    metadata: { [key: string]: string }
  ): Stripe.Checkout.SessionCreateParams {
    return {
      payment_method_types: ["card"],
      customer: customerId,
      line_items: lineItems,
      mode: "payment",
      metadata,
      success_url: `${process.env.MARKETPLACE_URL}/success-payment`,
      cancel_url: `${process.env.MARKETPLACE_URL}/canceled-payment`,
    };
  }

  verifyWebhookEvent(payload: string | Buffer, sig: string): Stripe.Event {
    try {
      return stripeClient.webhooks.constructEvent(
        payload,
        sig,
        stripeWebhookSecret
      );
    } catch (error) {
      throw new Error("Error constructing event");
    }
  }

  async getLineItemsFromSession(session: Stripe.Checkout.Session) {
    try {
      const lineItems = await stripeClient.checkout.sessions.listLineItems(
        session.id
      );
      return lineItems.data;
    } catch (error) {
      throw new Error("Error fetching line items");
    }
  }
}

export const stripeService = new StripeService();
