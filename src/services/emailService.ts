import fs from "fs";
import path from "path";
import ejs from "ejs";
import sendEmail from "../utils/sendEmail";
import appConfig from "../config/appConfig";


type VerificationEmailParams = {
  email: string;
  verificationCode: string;
  origin: string;
};

type ResetPasswordParams = {
  email: string;
  token: string;
  origin: string;
};

type PaymentConfirmationParams = {
  email: string;
  delivery: any;
  order: any;
};

export class EmailService { 

  // Load and render the EJS template
  private renderTemplate (templateName: string, data: { [key: string]: string }) {
    const templatePath = path.resolve(
      __dirname,
      "../templates",
      `${templateName}.ejs`
    );
    const template = fs.readFileSync(templatePath, "utf-8");
    return ejs.render(template, data);
  };


  async sendVerificationEmail ({
    email,
    verificationCode,
    origin,
  }: VerificationEmailParams): Promise<void> {
    const html = this.renderTemplate("emailConfirmation", {
      verificationCode,
      origin,
    });
  
    await sendEmail({
      to: email,
      subject: "Confirm Your Email Address - Electro Atlas",
      html,
    });
  };

  async sendResetPasswordEmail ({
    email,
    token,
    origin,
  }: ResetPasswordParams): Promise<void> {
    const resetLink = `${origin}/reset-password?resetToken=${token}`;
    const html = this.renderTemplate("passwordReset", {
      resetLink,
    });
  
    await sendEmail({
      to: email,
      subject: "Reset Your Password - Electro Atlas",
      html,
    });
  };

  async sendOrderConfirmationEmail ({
    email,
    delivery,
    order,
  }: PaymentConfirmationParams): Promise<void> {
    const { _id: orderId, totalAmount, orderItems } = order;
    const { shippingAddress } = delivery;
    const origin = appConfig.marketplaceUrl;
    const orderTrackingLink = `${origin}/order-tracking/${orderId}`;
    const accountLink = `${origin}/account`;
  
    const html = this.renderTemplate("orderConfirmation", {
      orderId,
      totalAmount,
      orderItems,
      shippingAddress,
      orderTrackingLink,
      accountLink,
    });
  
    await sendEmail({
      to: email,
      subject: "Order Confirmation - Electro Atlas",
      html,
    });
  };
}

export const emailService = new EmailService();
