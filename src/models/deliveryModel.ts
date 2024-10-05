import { Document, Model, Schema, Types, model } from "mongoose";
import { DELIVERY_STATUS, type DeliveryStatus } from "../utils/constants";

export interface TrackingUpdate {
  status: DeliveryStatus;
  location: string;
  timestamp: Date;
  description: string;
}

export interface DeliveryDoc extends Document {
  orderId: Types.ObjectId;
  userId: Types.ObjectId;
  deliveryStatus: DeliveryStatus;
  trackingNumber?: string;
  carrier?: string; // Examples: "UPS", "FedEx", "USPS", "DHL", etc.
  estimatedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  //   signatureRequired: boolean;
  deliveryInstructions?: string;
  trackingHistory: TrackingUpdate[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryModel extends Model<DeliveryDoc> {
  updateDeliveryStatus(
    this: DeliveryModel,
    deliveryId: Types.ObjectId,
    newStatus: DeliveryStatus,
    location: string,
    description: string
  ): Promise<DeliveryDoc>;
  updateTrackingInfo(
    this: DeliveryModel,
    deliveryId: Types.ObjectId,
    trackingNumber: string,
    carrier: string
  ): Promise<DeliveryDoc>;
}

const DeliverySchema = new Schema<DeliveryDoc, DeliveryModel>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deliveryStatus: {
      type: String,
      enum: Object.values(DELIVERY_STATUS),
      default: DELIVERY_STATUS.PENDING,
    },
    trackingNumber: { type: String },
    carrier: { type: String },
    estimatedDeliveryDate: { type: Date, required: true },
    actualDeliveryDate: { type: Date },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    // signatureRequired: { type: Boolean, default: false },
    deliveryInstructions: { type: String },
    trackingHistory: [
      {
        status: {
          type: String,
          enum: Object.values(DELIVERY_STATUS),
          required: true,
        },
        location: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        description: { type: String },
      },
    ],
  },
  { timestamps: true }
);

DeliverySchema.statics.updateDeliveryStatus = async function (
  this: DeliveryModel,
  deliveryId: Types.ObjectId,
  newStatus: DeliveryStatus,
  location: string,
  description: string
): Promise<DeliveryDoc> {
  const delivery = await this.findById(deliveryId);
  if (!delivery) {
    throw new Error("Delivery not found");
  }

  delivery.deliveryStatus = newStatus;
  delivery.trackingHistory.push({
    status: newStatus,
    location,
    timestamp: new Date(),
    description,
  });

  if (newStatus === DELIVERY_STATUS.DELIVERED) {
    delivery.actualDeliveryDate = new Date();
  }

  await delivery.save();
  return delivery;
};

DeliverySchema.statics.updateTrackingInfo = async function (
  this: DeliveryModel,
  deliveryId: Types.ObjectId,
  trackingNumber: string,
  carrier: string
): Promise<DeliveryDoc> {
  const delivery = await this.findByIdAndUpdate(
    deliveryId,
    { trackingNumber, carrier },
    { new: true }
  );
  if (!delivery) {
    throw new Error("Delivery not found");
  }
  return delivery;
};

const Delivery = model<DeliveryDoc, DeliveryModel>("Delivery", DeliverySchema);

export default Delivery;
