import { Types } from "mongoose";
import { Order, OrderItem } from "../models";
import { ORDER_STATUS } from "../utils/constants";
import { cartService } from "./cartService";

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResult {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
}

export interface OrderQueryParams {
  userId?: string;
}

interface OrderWithPagination {
  orders: any[];
  pagination: PaginationResult;
}

class OrderService {
  async getBuyerOrders(
    userId: string,
    { page = 1, limit = 10 }: PaginationParams
  ): Promise<OrderWithPagination> {
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const [orders, totalCount] = await Promise.all([
      Order.find({ userId })
      .populate({ path: "orderItems", select: "-__v", options: { lean: true } })
      .select("-__v")
      .sort({ createdAt: "desc" })
      .skip(skip)
      .limit(limitNumber)
      .lean(),
      Order.countDocuments({ userId })
    ]);

    return {
      orders,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalCount / limitNumber),
        totalCount,
        limit: limitNumber,
      },
    };
  }

  async getAllOrders(
    params: OrderQueryParams & PaginationParams
  ): Promise<OrderWithPagination> {
    const { userId, page = 1, limit = 10 } = params;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const query: Record<string, any> = {};
    if (userId) {
      query.userId = userId;
    }

    const [orders, totalCount] = await Promise.all([
      Order.find(query)
      .populate({ path: "orderItems", select: "-__v", options: { lean: true } })
      .select("-__v")
      .sort({ createdAt: "desc" })
      .skip(skip)
      .limit(limitNumber)
      .lean(),
      Order.countDocuments(query)
    ]);

    return {
      orders,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalCount / limitNumber),
        totalCount,
        limit: limitNumber,
      },
    };
  }

  async getOrderById(orderId: string): Promise<any> {
    const order = await Order.findById(orderId)
      .populate({ path: "orderItems", select: "-__v", options: { lean: true } })
      .select("-__v")
      .lean();

    if (!order) {
      throw new Error("Order not found");
    }

    return order;
  }
  
  async createNewOrder({ paymentId, session }: any) {
    const cartId = session.metadata!.cartId;
    const userId = session.metadata!.userId;
    const totalAmount = session.amount_total! / 100;
    const cartItems = await cartService.getCartItems(cartId);
    if (!cartItems || cartItems.length === 0) throw new Error("Cart is empty");

    const order = await Order.create({
      userId,
      paymentId,
      totalAmount,
      orderStatus: ORDER_STATUS.CREATED,
    });

    const orderItems = cartItems.map((item) => {
      return {
        productId: item.productId,
        orderId: order._id,
        sellerId: item.sellerId,
        quantity: item.quantity,
        salePrice: item.variant.salePrice,
        totalPrice: item.totalPrice,
        productName: item.productName,
        sku: item.variant.sku,
        image: item.image,
      };
    });

    await OrderItem.insertMany(orderItems);
    const updatedOrder = await this.updateOrderById(order._id);

    return updatedOrder;
  }

  async updateOrderById(orderId: unknown) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error("Order not found");
      }

      const orderItems = await OrderItem.find({ orderId }).lean();
      if (!orderItems || orderItems.length === 0) {
        throw new Error("No order items found for the provided order ID");
      }

      let total = 0;
      for (const item of orderItems) {
        total += item.salePrice * item.quantity;
      }

      total += order.taxAmount + order.shippingAmount - order.discountAmount;
      total = parseFloat(total.toFixed(2));

      order.orderItems = orderItems as any;
      order.totalAmount = total;
      await order.save();

      return order;
    } catch (error) {
      throw new Error("Error updating order");
    }
  }

  async updateOrderStatus(orderId: string, newStatus: string) {
    try {
      await Order.findByIdAndUpdate(orderId, { orderStatus: newStatus });
    } catch (error) {
      throw new Error("Failed to update order status");
    }
  }

  async calculateTotal(orderItemId: unknown): Promise<number> {
    try {
      const orderItem = await OrderItem.findById(orderItemId);
      if (!orderItem) {
        throw new Error("Order item not found");
      }
      const total =
        orderItem.salePrice * (orderItem.quantity - orderItem.refundedQuantity);
      const totalPrice = parseFloat(total.toFixed(2));

      await OrderItem.findByIdAndUpdate(orderItemId, { totalPrice });
      return total;
    } catch (error) {
      throw new Error("Error calculating total for order item");
    }
  }

  async updateRefundStatus(
    orderItemId: unknown,
    refundedQuantity: number
  ): Promise<void> {
    try {
      const orderItem = await OrderItem.findById(orderItemId);
      if (!orderItem) {
        throw new Error("Order item not found");
      }
      if (refundedQuantity > orderItem.quantity) {
        throw new Error("Refunded quantity cannot exceed original quantity");
      }
      const newRefundedQuantity = orderItem.refundedQuantity + refundedQuantity;
      const isFullyRefunded = newRefundedQuantity === orderItem.quantity;
      await OrderItem.findByIdAndUpdate(orderItemId, {
        refundedQuantity: newRefundedQuantity,
        isRefunded: isFullyRefunded,
      });
      await this.calculateTotal(orderItemId);
    } catch (error) {
      throw new Error("Error updating refund status for order item");
    }
  }
}

export const orderService = new OrderService();
