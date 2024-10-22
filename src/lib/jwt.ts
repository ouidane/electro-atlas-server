import dotenv from "dotenv";
import jwt, { JwtPayload } from "jsonwebtoken";
dotenv.config();

const jwtSecretKey = process.env.JWT_SECRET_KEY as string;

export function generateToken(payload: any) {
  const options = { expiresIn: "10m" };
  const token = jwt.sign(payload, jwtSecretKey, options);
  return token;
}

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, jwtSecretKey) as JwtPayload;
    return decoded;
  } catch (err) {
    return null;
  }
}
