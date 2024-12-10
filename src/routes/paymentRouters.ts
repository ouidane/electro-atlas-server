import express, { Router, Request, Response, NextFunction } from "express";
import { authenticateUser } from "../middlewares/premissions";
import { paymentController } from "../controllers/paymentController";

const router: Router = express.Router();

// Regular routes
router.post(
  "/checkout",
  authenticateUser,
  paymentController.createStripeCheckout
);

// Webhook route with raw body handling
router.post("/webhook", paymentController.stripeWebhook);

export default router;
