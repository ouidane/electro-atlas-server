import { Document, Model, Types } from "mongoose";
import { type DeliveryStatus } from "../utils/constants";
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
    carrier?: string;
    estimatedDeliveryDate: Date;
    actualDeliveryDate?: Date;
    shippingAddress: {
        street: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
    };
    deliveryInstructions?: string;
    trackingHistory: TrackingUpdate[];
    createdAt: Date;
    updatedAt: Date;
}
export interface DeliveryModel extends Model<DeliveryDoc> {
    updateDeliveryStatus(this: DeliveryModel, deliveryId: Types.ObjectId, newStatus: DeliveryStatus, location: string, description: string): Promise<DeliveryDoc>;
    updateTrackingInfo(this: DeliveryModel, deliveryId: Types.ObjectId, trackingNumber: string, carrier: string): Promise<DeliveryDoc>;
}
declare const Delivery: DeliveryModel;
export default Delivery;
