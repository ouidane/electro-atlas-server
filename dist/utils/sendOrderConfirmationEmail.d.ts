interface OrderConfirmationParams {
    email: string;
    delivery: any;
    order: any;
    origin: string;
}
declare const sendOrderConfirmationEmail: ({ email, delivery, order, origin, }: OrderConfirmationParams) => Promise<void>;
export default sendOrderConfirmationEmail;
