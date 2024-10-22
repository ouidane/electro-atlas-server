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
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<OrderItemDoc>(
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

const OrderItem = model<OrderItemDoc>("OrderItem", OrderItemSchema);

export default OrderItem;
