import mongoose from "mongoose";
import { logger } from "../utils/logger";

const mongoDB = async (uri: string): Promise<void> => {
  try {
    await mongoose.connect(uri);
    logger.info("Connected to MongoDB database");
  } catch (err: any) {
    logger.error(`MongoDB connection error: ${err.message}`);
  }
};

export default mongoDB;
