import { Document, Schema, Types, model } from "mongoose";
import {
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  type PaymentStatus,
  type PaymentMethod,
} from "../utils/constants";

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

const PaymentSchema = new Schema<PaymentDoc>(
  {
    amountTotal: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerId: {
      type: String,
    },
    transactionId: {
      type: String,
    },
    refundId: {
      type: String,
    },
  },
  { timestamps: true }
);

const Payment = model("Payment", PaymentSchema);

export default Payment;
