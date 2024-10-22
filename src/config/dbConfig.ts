import dotenv from "dotenv";
import mongoose from "mongoose";
import { logger } from "../utils/logger";

dotenv.config();

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_NAME;

const mongoUri = `mongodb+srv://${dbUser}:${dbPassword}@${dbHost}/${dbName}`;

const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri);
    logger.info("Connected to MongoDB");
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
