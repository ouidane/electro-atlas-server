import nodemailer, { Transporter } from "nodemailer";
import nodemailerConfig from "../config/nodemailerConfig";

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
  const transporter: Transporter = nodemailer.createTransport(nodemailerConfig);

  await transporter.sendMail({
    from: '"Electro Atlas" <no-reply@electroatlas.com>',
    to,
    subject,
    html,
  });
};

export default sendEmail;
