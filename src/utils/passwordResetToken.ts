import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import debug from "debug";

dotenv.config();

interface ResetTokenPayload {
  userId: string;
  passwordToken: string;
}

const debugLogResetToken = debug("myapp:ResetToken");
const secretKey = process.env.PASSWORD_RESET_SECRET_KEY as string;

export function generateResetToken(payload: ResetTokenPayload): string {
  const options = { expiresIn: "15m" };

  const token = jwt.sign(payload, secretKey, options);
  return token;
}

export function validateResetToken(token: string): ResetTokenPayload | null {
  try {
    const decoded = jwt.verify(token, secretKey) as ResetTokenPayload;
    return decoded;
  } catch (err) {
    debugLogResetToken("Invalid or expired token");
    return null;
  }
}
