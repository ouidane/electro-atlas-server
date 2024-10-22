import { Document, Schema, Types, model } from "mongoose";

// Define the interface for Cart document
export interface CartItemDoc extends Document {
  quantity: number;
  cartId: Types.ObjectId;
  productId: Types.ObjectId;
  sku: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Create the schema for Cart
const CartItemSchema = new Schema<CartItemDoc>(
  {
    quantity: {
      type: Number,
      required: [true, "quantity is required"],
    },
    cartId: {
      type: Schema.Types.ObjectId,
      ref: "Cart",
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
    },
  },
  { timestamps: true }
);

// Create the Cart model
const CartItem = model<CartItemDoc>("CartItem", CartItemSchema);

export default CartItem;
