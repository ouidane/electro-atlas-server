import { Request, Response, NextFunction } from "express";
import { Order, OrderItem } from "../models";
import createError from "http-errors";

const getBuyerOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user.id;
  const { limit = 10, page = 1 } = req.query;

  const pageNumber = parseInt(page as string) || 1;
  const limitNumber = parseInt(limit as string) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  const orders = await Order.find({ userId })
    .populate({ path: "orderItems", select: "-__v", options: { lean: true } })
    .select("-__v")
    .sort({ createdAt: "desc" })
    .skip(skip)
    .limit(limitNumber)
    .lean();

  const totalCount = await Order.countDocuments({ userId });

  res.status(200).json({
    orders,
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / limitNumber),
      totalCount,
      limit: limitNumber,
    },
  });
};

const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, limit = 10, page = 1 } = req.query;
  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);
  const skip = (pageNumber - 1) * limitNumber;

  // Build the query
  const query: any = {};
  if (userId) {
    query.userId = userId;
  }

  const orders = await Order.find(query)
    .populate({ path: "orderItems", select: "-__v", options: { lean: true } })
    .select("-__v")
    .sort({ createdAt: "desc" })
    .skip(skip)
    .limit(limitNumber)
    .lean();

  const totalOrders = await Order.countDocuments(query);

  res.status(200).json({
    orders,
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(totalOrders / limitNumber),
      totalOrders,
      limit: limitNumber,
    },
  });
};

const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId)
    .populate({ path: "orderItems", select: "-__v", options: { lean: true } })
    .select("-__v")
    .lean();
  if (!order) {
    return next(createError(404, "Order not found"));
  }

  res.status(200).json({ order });
};

export { getBuyerOrders, getAllOrders, getOrderById };
