import mongoose from "mongoose";
import { logger } from "../utils/logger";

const mongoDB = async (uri: string): Promise<void> => {
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,  // Adjust the timeout if necessary
      connectTimeoutMS: 10000          // Adjust the timeout if necessary
    });
    logger.info("Connected to MongoDB database");
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
  }
};

export default mongoDB;
