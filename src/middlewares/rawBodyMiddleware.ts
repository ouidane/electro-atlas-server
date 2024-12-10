import bodyParser from "body-parser";
import { Request, Response, NextFunction } from "express";

const rawBodyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl === "/api/v1/payment/webhook") {
    bodyParser.raw({ type: "application/json" })(req, res, next);
  } else {
    bodyParser.json()(req, res, next);
  }
};

export default rawBodyMiddleware;
