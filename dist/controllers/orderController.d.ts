import { Request, Response, NextFunction } from "express";
declare const getBuyerOrders: (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const getAllOrders: (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const getOrderById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export { getBuyerOrders, getAllOrders, getOrderById };
