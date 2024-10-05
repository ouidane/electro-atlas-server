import express, { Router, Request, Response, NextFunction } from "express";
import { authenticateUser } from "../middleware/premissions";
import {
  createStripeCheckout,
  stripeWebhook,
} from "../controllers/paymentController";

const router: Router = express.Router();

// Regular routes
router.post("/checkout", authenticateUser, createStripeCheckout);

// Webhook route with raw body handling
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

export default router;
