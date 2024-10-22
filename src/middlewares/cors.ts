import cors, { CorsOptions } from "cors";
import appConfig from "../config/appConfig";

const whitelist = [
  appConfig.baseUrl,
  appConfig.marketplaceUrl,
  appConfig.vendorUrl,
];

const corsOptions: CorsOptions = {
  // origin: (origin, callback) => {
  //   if (!origin || whitelist.includes(origin)) {
  //     callback(null, true);
  //   } else {
  //     const error = new Error("Not allowed by CORS") as Error & {
  //       name: string;
  //     };
  //     error.name = "CorsError";
  //     callback(error);
  //   }
  // },
  origin: "*",
  optionsSuccessStatus: 200,
  credentials: true,
};

// Export the configured CORS middleware
const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
