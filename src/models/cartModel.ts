import { Document, Schema, Types, model } from "mongoose";
import CartItem from "./cartItemModel";

// Define the interface for ShoppingCart document
export interface CartDoc extends Document {
  amount: number;
  totalProducts: number;
  totalItems: number;
  userId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

// Create the schema for ShoppingCart
const CartSchema = new Schema<CartDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      default: 0,
    },
    totalProducts: {
      type: Number,
      default: 0,
    },
    totalItems: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

CartSchema.pre<CartDoc>(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      await CartItem.deleteMany({ cartId: this._id });
      next();
    } catch (err: any) {
      next(err);
    }
  }
);

const Cart = model<CartDoc>("Cart", CartSchema);
export default Cart;
