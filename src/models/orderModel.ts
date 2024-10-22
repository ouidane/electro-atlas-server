import { Document, Model, Schema, Types, model } from "mongoose";
import { ORDER_STATUS, type OrderStatus } from "../utils/constants";
import { OrderItemDoc } from "./orderItemModel";

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
  notes: string;
  createdAt: Date;
  updatedAt: Date;
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

const Order = model<OrderDoc>("Order", OrderSchema);
export default Order;
