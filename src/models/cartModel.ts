import { Document, Model, Schema, Types, model } from "mongoose";
import CartItem, { CartItemDoc } from "./cartItemModel";

// Define the interface for ShoppingCart document
export interface CartDoc extends Document {
  amount?: number;
  totalProducts?: number;
  totalItems?: number;
  userId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CartModel extends Model<CartDoc> {
  updateCart(cartId: unknown): Promise<void>;
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

CartSchema.statics.updateCart = async function (
  cartId: unknown
): Promise<void> {
  try {
    const cartItems = await CartItem.find({ cartId })
      .populate("productId")
      .lean();

    const totalItems = cartItems.length;

    const totalProducts = cartItems.reduce((acc, current) => {
      return acc + current.quantity;
    }, 0);

    const totalPrice = cartItems.reduce((acc, current) => {
      const product = current.productId as any;
      const variant = product.variants.find(
        (variant: any) => variant.sku === current.sku
      );
      const productPrice = variant.salePrice;
      return acc + current.quantity * productPrice;
    }, 0);

    await this.findByIdAndUpdate(cartId, {
      amount: parseFloat(totalPrice.toFixed(2)),
      totalItems,
      totalProducts,
    });
  } catch (error: any) {
    throw new Error("Error updating cart");
  }
};

const Cart = model<CartDoc, CartModel>("Cart", CartSchema);
export default Cart;
