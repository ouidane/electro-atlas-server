import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { paymentService } from "../services/paymentService";
import { stripeService } from "../services/stripeService";

export class PaymentController {
  async createStripeCheckout(req: Request, res: Response, next: NextFunction) {
    const userId = req.user.id;
    const checkoutUrl = await paymentService.createCheckoutSession(userId);
    res.status(200).json({ url: checkoutUrl });
  }

  async stripeWebhook(req: Request, res: Response) {
    const sig = req.headers["stripe-signature"] as string;

    console.log("Received signature:", req.headers["stripe-signature"]);
    console.log("Raw body:", req.body.toString());

    try {
      const event = stripeService.verifyWebhookEvent(req.body, sig);
      await paymentService.handleStripeEvent(event);
      res.json({ received: true });
    } catch (error: any) {
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  }
}

export const paymentController = new PaymentController();
