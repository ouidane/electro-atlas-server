import { Document, Model, Types } from "mongoose";
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
declare const Cart: CartModel;
export default Cart;
