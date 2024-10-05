import { Document, Schema, Types, model } from "mongoose";
import { ProductDoc } from "./productModel";
import { ProductVariantsDoc } from "./productVariantsModel";

// Define the interface for WishlistItem
export interface WishlistItemDoc extends Document {
  product: Types.ObjectId | ProductDoc;
  variant: ProductVariantsDoc;
  sku: string;
}

// Define the interface for Wishlist document
export interface WishlistDoc extends Document {
  userId: Types.ObjectId;
  items: Types.DocumentArray<WishlistItemDoc>;
  createdAt?: Date;
  updatedAt?: Date;
}

// Create the schema for WishlistItem
const WishlistItemSchema = new Schema<WishlistItemDoc>({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
});

// Create the schema for Wishlist
const WishlistSchema = new Schema<WishlistDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [WishlistItemSchema],
  },
  { timestamps: true }
);

// Create the Wishlist model
const Wishlist = model<WishlistDoc>("Wishlist", WishlistSchema);

export default Wishlist;
