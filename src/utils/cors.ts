import dotenv from "dotenv";

dotenv.config();

const URLs = [process.env.MARKETPLACE_URL, process.env.SERVER_URL];
if (!URLs) {
  throw new Error("CLIENT_URL environment variable is not defined.");
}

const whitelist: string[] = URLs.map((url) => url.trim());

const corsOptions = {
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
  origin: function (origin, callback) {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true); // Allow requests with no origin (like mobile apps, curl requests, etc.) or if origin is whitelisted
    } else {
      const error = new Error("Not allowed by CORS");
      error.name = "CorsError";
      callback(error, false);
    }
  },
  credentials: true, // Allow cookies and other credentials to be sent
};

export default corsOptions;
