import { Document, Model, Types } from "mongoose";
import { type FormattedItem } from "../@types/types";
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
declare const CartItem: ItemModel;
export default CartItem;
