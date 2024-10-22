import { Request, Response, NextFunction } from "express";
import { orderService } from "../services/orderService";

class OrderController {
  async getBuyerOrders(req: Request, res: Response) {
    const userId = req.user.id;
    const { limit, page } = req.query;
    const result = await orderService.getBuyerOrders(userId, {
      page: Number(page),
      limit: Number(limit),
    });

    res.status(200).json(result);
  }

  async getAllOrders(req: Request, res: Response) {
    const { userId, limit, page } = req.query;
    const result = await orderService.getAllOrders({
      userId: userId as string,
      page: Number(page),
      limit: Number(limit),
    });

    res.status(200).json(result);
  }

  async getOrderById(req: Request, res: Response) {
    const { orderId } = req.params;
    const order = await orderService.getOrderById(orderId);

    res.status(200).json({ order });
  }
}

export const orderController = new OrderController();
