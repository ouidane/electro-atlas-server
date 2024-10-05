import { Document, Model, Schema, Types, model } from "mongoose";

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
  calculateTotal(
    this: OrderItemModel,
    orderItemId: Types.ObjectId
  ): Promise<number>;
  updateRefundStatus(
    this: OrderItemModel,
    orderItemId: Types.ObjectId,
    refundedQuantity: number
  ): Promise<void>;
}

const OrderItemSchema = new Schema<OrderItemDoc, OrderItemModel>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    salePrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    image: { type: String },
    isRefunded: { type: Boolean, default: false },
    refundedQuantity: { type: Number, default: 0, min: 0 },
    notes: { type: String },
  },
  { timestamps: true }
);

OrderItemSchema.statics.calculateTotal = async function (
  orderItemId: Types.ObjectId
): Promise<number> {
  try {
    const orderItem = await this.findById(orderItemId);
    if (!orderItem) {
      throw new Error("Order item not found");
    }
    const total =
      orderItem.salePrice * (orderItem.quantity - orderItem.refundedQuantity);
    const totalPrice = parseFloat(total.toFixed(2))

    await this.findByIdAndUpdate(orderItemId, { totalPrice });
    return total;
  } catch (error) {
    throw new Error("Error calculating total for order item");
  }
};

OrderItemSchema.statics.updateRefundStatus = async function (
  this: OrderItemModel,
  orderItemId: Types.ObjectId,
  refundedQuantity: number
): Promise<void> {
  try {
    const orderItem = await this.findById(orderItemId);
    if (!orderItem) {
      throw new Error("Order item not found");
    }
    if (refundedQuantity > orderItem.quantity) {
      throw new Error("Refunded quantity cannot exceed original quantity");
    }
    const newRefundedQuantity = orderItem.refundedQuantity + refundedQuantity;
    const isFullyRefunded = newRefundedQuantity === orderItem.quantity;
    await this.findByIdAndUpdate(orderItemId, {
      refundedQuantity: newRefundedQuantity,
      isRefunded: isFullyRefunded,
    });
    await this.calculateTotal(orderItemId);
  } catch (error) {
    throw new Error("Error updating refund status for order item");
  }
};

const OrderItem = model<OrderItemDoc, OrderItemModel>(
  "OrderItem",
  OrderItemSchema
);

export default OrderItem;
