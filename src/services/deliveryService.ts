import { Delivery } from "../models";
import { DELIVERY_STATUS } from "../utils/constants";

class DeliveryService {
  async createNewDelivery(profile: any, orderId: unknown) {
    const twoDays = 2 * 24 * 60 * 60 * 1000;
    const estimatedDeliveryDate = new Date(Date.now() + twoDays);

    const delivery = await Delivery.create({
      orderId,
      deliveryStatus: DELIVERY_STATUS.PENDING,
      estimatedDeliveryDate,
      userId: profile.userId,
      carrier: "FedEx",
      shippingAddress: {
        street: profile.address.line1,
        city: profile.address.city,
        country: profile.address.country,
        postalCode: profile.address.postalCode,
      },
    });

    return delivery;
  }
}

export const deliveryService = new DeliveryService();
