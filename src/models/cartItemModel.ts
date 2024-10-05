import { Document, Model, Schema, Types, model } from "mongoose";
import { type FormattedItem } from "../@types/types";

// Define the interface for Cart document
export interface CartItemDoc extends Document {
  quantity: number;
  cartId: Types.ObjectId;
  productId: Types.ObjectId;
  sku: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ItemModel extends Model<CartItemDoc> {
  getFormattedCartItems(cartId: unknown): Promise<FormattedItem[]>;
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

// Define the static method for formattedCartItems
CartItemSchema.statics.getFormattedCartItems = async function (
  cartId: unknown
): Promise<FormattedItem[]> {
  try {
    if ( typeof cartId === "string") {
      cartId = new Types.ObjectId(cartId)
    }

    const cartItems: FormattedItem[] = await this.aggregate([
      { $match: { cartId } },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $addFields: {
          matchedVariant: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$product.variants",
                  as: "variant",
                  cond: { $eq: ["$$variant.sku", "$sku"] },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $project: {
          _id: 0,
          itemId: "$_id",
          quantity: 1,
          productId: 1,
          productName: "$product.name",
          totalPrice: {
            $round: [
              {
                $multiply: [
                  "$quantity",
                  {
                    $ifNull: [
                      "$matchedVariant.salePrice",
                      "$matchedVariant.globalPrice",
                    ],
                  },
                ],
              },
              2
            ],
          },
          image: { $arrayElemAt: ["$product.images.tiny", 0] },
          sellerId: "$product.sellerId",
          variant: "$matchedVariant",
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    return cartItems;
  } catch (error: any) {
    throw new Error(`Error fetching formatted cart items: ${error.message}`);
  }
};

// Create the Cart model
const CartItem = model<CartItemDoc, ItemModel>("CartItem", CartItemSchema);

export default CartItem;
