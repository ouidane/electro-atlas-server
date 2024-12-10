import express, { Request, Response, NextFunction } from "express";

// Middleware to capture raw body for Stripe webhook
const rawBodyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl === "/api/v1/payment/webhook") {
    express.raw({ type: "application/json" })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
};

export default rawBodyMiddleware;
