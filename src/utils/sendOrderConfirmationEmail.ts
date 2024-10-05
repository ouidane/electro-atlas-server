import { DeliveryDoc } from "../models/deliveryModel";
import { OrderDoc } from "../models/orderModel";
import sendEmail from "./sendEmail";

interface OrderConfirmationParams {
  email: string;
  delivery: any;
  order: any;
  origin: string;
}

const sendOrderConfirmationEmail = async ({
  email,
  delivery,
  order,
  origin,
}: OrderConfirmationParams): Promise<void> => {
  const { _id: orderId, totalAmount, orderItems } = order;
  const { shippingAddress } = delivery;

  const itemsList = orderItems
    .map(
      (item) => `
      <tr>
        <td>${item.productName}</td>
        <td>${item.quantity}</td>
        <td>$${item.salePrice.toFixed(2)}</td>
        <td>$${(item.quantity * item.salePrice).toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  const orderTrackingLink = `${origin}/order-tracking/${orderId}`;
  const accountLink = `${origin}/account`;

  await sendEmail({
    to: email,
    subject: "Order Confirmation - Electro Atlas",
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - Electro Atlas</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
                color: #333;
            }
            .email-container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .email-header {
                background-color: #007bff;
                color: #ffffff;
                padding: 20px;
                text-align: center;
                font-size: 24px;
                font-weight: bold;
            }
            .email-body {
                padding: 20px;
            }
            .email-body h2 {
                color: #007bff;
                font-size: 20px;
            }
            .email-body p {
                line-height: 1.6;
                margin: 10px 0;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }
            th {
                background-color: #f2f2f2;
            }
            .total {
                font-weight: bold;
                text-align: right;
            }
            .button {
                display: inline-block;
                padding: 10px 20px;
                background-color: #007bff;
                color: #ffffff;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 15px;
            }
            .email-footer {
                background-color: #f4f4f4;
                text-align: center;
                padding: 20px;
                font-size: 12px;
                color: #888888;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                Electro Atlas
            </div>
            <div class="email-body">
                <h2>Order Confirmation</h2>
                <p>Thank you for your purchase! Your order has been confirmed and is being processed.</p>
                <p><strong>Order ID:</strong> ${orderId}</p>
                <h3>Order Summary</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsList}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" class="total">Total:</td>
                            <td>$${totalAmount.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
                <h3>Shipping Address</h3>
                <p>
                    ${shippingAddress.street}<br>
                    ${shippingAddress.city}, ${shippingAddress.postalCode}<br>
                    ${shippingAddress.country}
                </p>
                <p>You can track your order status here:</p>
                <a href="${orderTrackingLink}" class="button">Track Your Order</a>
                <p>To view your complete order history or make changes to your account, please visit your account page:</p>
                <a href="${accountLink}" class="button">Your Account</a>
                <p>We'll send you another email when your order ships. If you have any questions or concerns, please don't hesitate to contact our customer support team at <a href="mailto:support@electroatlas.com">support@electroatlas.com</a>.</p>
            </div>
            <div class="email-footer">
                Thank you for shopping with Electro Atlas!<br>
                &copy; 2024 Electro Atlas. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    `,
  });
};

export default sendOrderConfirmationEmail;
