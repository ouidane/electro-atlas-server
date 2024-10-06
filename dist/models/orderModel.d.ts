import { Document, Model, Types } from "mongoose";
import { type OrderStatus } from "../utils/constants";
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
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface OrderModel extends Model<OrderDoc> {
    updateOrderById(orderId: unknown): Promise<void>;
}
declare const Order: OrderModel;
export default Order;
