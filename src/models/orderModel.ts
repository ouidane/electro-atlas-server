import { Document, Model, Schema, Types, model } from "mongoose";
import { ORDER_STATUS, type OrderStatus } from "../utils/constants";
import OrderItem, { OrderItemDoc } from "./orderItemModel";

export interface OrderDoc extends Document {
  userId: Types.ObjectId;
  deliveryId: Types.ObjectId;
  paymentId: Types.ObjectId;
  orderItems: Types.DocumentArray<OrderItemDoc>;
  totalAmount: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  orderStatus: OrderStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderModel extends Model<OrderDoc> {
  updateOrderById(orderId: unknown): Promise<void>;
}

const OrderSchema = new Schema<OrderDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    deliveryId: { type: Schema.Types.ObjectId, ref: "Delivery" },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
    orderItems: [{ type: Schema.Types.ObjectId, ref: "OrderItem" }],
    totalAmount: { type: Number, min: 0 },
    taxAmount: { type: Number, default: 0 },
    shippingAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    orderStatus: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.CREATED,
    },
    notes: { type: String },
  },
  { timestamps: true }
);

OrderSchema.statics.updateOrderById = async function (
  orderId: unknown
): Promise<void> {
  try {
    const order = await this.findById(orderId)
    .populate({ path: "orderItems", options: { lean: true } })
    .lean();
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
    total = parseFloat(total.toFixed(2))

    await this.findByIdAndUpdate(orderId, { orderItems, totalAmount: total });
  } catch (error) {
    throw new Error("Error updating order");
  }
};

const Order = model<OrderDoc, OrderModel>("Order", OrderSchema);
export default Order;
