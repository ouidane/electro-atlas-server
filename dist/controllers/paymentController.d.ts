import { Request, Response, NextFunction } from "express";
declare const createStripeCheckout: (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const stripeWebhook: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export { createStripeCheckout, stripeWebhook };
