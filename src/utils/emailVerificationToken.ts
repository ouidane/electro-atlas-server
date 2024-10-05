import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import debug from "debug";

dotenv.config();

interface EmailVerificationPayload {
  verificationCode: string;
  email: string;
  createdAt: number;
}

const debugLogVerificationToken = debug("myapp:VerificationToken");
const secretKey = process.env.EMAIL_VERIFICATION_SECRET_KEY as string;

export function generateEmailVerificationToken(
  verificationCode: string,
  email: string
): string {
  const payload: EmailVerificationPayload = {
    verificationCode,
    email,
    createdAt: Date.now(),
  };

  const options = { expiresIn: "10m" };

  const token = jwt.sign(payload, secretKey, options);
  return token;
}

export function validateEmailVerificationToken(
  token: string
): EmailVerificationPayload | null {
  try {
    const decoded = jwt.verify(token, secretKey) as EmailVerificationPayload;
    return decoded;
  } catch (err) {
    debugLogVerificationToken("Invalid or expired token");
    return null;
  }
}

export function generateVerificationCode() {
  let code = "";

  for (let i = 0; i < 6; i++) {
    const digit = Math.floor(Math.random() * 10);
    code += digit;
  }

  return code;
}
