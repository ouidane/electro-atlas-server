import dotenv from "dotenv";
dotenv.config();
import nodemailer, { Transporter } from "nodemailer";

const nodemailerConfig = {
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: process.env.NODE_ENV === "production",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
};

interface EmailContent {
  to: string;
  subject: string;
  html: string;
}

const sendEmail = async ({
  to,
  subject,
  html,
}: EmailContent): Promise<void> => {
  const transporter: Transporter = nodemailer.createTransport(nodemailerConfig);

  await transporter.sendMail({
    from: '"Electro Atlas" <no-reply@electroatlas.com>',
    to,
    subject,
    html,
  });
};

export default sendEmail;
