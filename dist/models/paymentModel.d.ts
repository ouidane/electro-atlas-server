import { Document, Schema, Types } from "mongoose";
import { type PaymentStatus, type PaymentMethod } from "../utils/constants";
export interface PaymentDoc extends Document {
    amountTotal: number;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    userId: Types.ObjectId;
    customerId?: string;
    transactionId?: string;
    refundId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
declare const Payment: import("mongoose").Model<PaymentDoc, {}, {}, {}, Document<unknown, {}, PaymentDoc> & PaymentDoc & Required<{
    _id: unknown;
}> & {
    __v?: number;
}, Schema<PaymentDoc, import("mongoose").Model<PaymentDoc, any, any, any, Document<unknown, any, PaymentDoc> & PaymentDoc & Required<{
    _id: unknown;
}> & {
    __v?: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PaymentDoc, Document<unknown, {}, import("mongoose").FlatRecord<PaymentDoc>> & import("mongoose").FlatRecord<PaymentDoc> & Required<{
    _id: unknown;
}> & {
    __v?: number;
}>>;
export default Payment;
