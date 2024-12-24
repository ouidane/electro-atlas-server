import nodemailer, { Transporter } from "nodemailer";
import nodemailerConfig from "../config/nodemailerConfig";
import { th } from "@faker-js/faker/.";

type EmailContent = {
  to: string;
  subject: string;
  html: string;
};

const sendEmail = async ({
  to,
  subject,
  html,
}: EmailContent): Promise<void> => {
  try {
    const transporter: Transporter = nodemailer.createTransport(nodemailerConfig);
  
    await transporter.sendMail({
      from: `"Electro Atlas" <${nodemailerConfig.auth.user}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    throw new Error("Error sending email: " + error);
  }
};

export default sendEmail;
