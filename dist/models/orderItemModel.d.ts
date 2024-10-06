import { Document, Model, Types } from "mongoose";
export interface OrderItemDoc extends Document {
    orderId: Types.ObjectId;
    productId: Types.ObjectId;
    sellerId: Types.ObjectId;
    quantity: number;
    salePrice: number;
    totalPrice: number;
    productName: string;
    sku: string;
    image?: string;
    isRefunded: boolean;
    refundedQuantity: number;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface OrderItemModel extends Model<OrderItemDoc> {
    calculateTotal(this: OrderItemModel, orderItemId: Types.ObjectId): Promise<number>;
    updateRefundStatus(this: OrderItemModel, orderItemId: Types.ObjectId, refundedQuantity: number): Promise<void>;
}
declare const OrderItem: OrderItemModel;
export default OrderItem;
