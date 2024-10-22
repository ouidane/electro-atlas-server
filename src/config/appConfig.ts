import dotenv from "dotenv";
dotenv.config();

const appConfig = {
  environment: process.env.NODE_ENV, // Node environment (dev, prod, etc.)
  port: process.env.PORT || 5000, // Server port
  appName: process.env.APP_NAME || "Electro Atlas Server", // Application name

  sessionPrivateKey: process.env.SESSION_PRIVATE_KEY as string, // Session private key

  stripeSecretKey: process.env.STRIPE_KEY as string, // Stripe API key
  stripeWebhookSecret: process.env.STRIPE_ENDPOINT_SECRET as string, // Stripe webhook endpoint secret

  marketplaceUrl: process.env.MARKETPLACE_URL as string, // Marketplace URL
  vendorUrl: process.env.VENDOR_URL as string, // Vendor URL
  baseUrl: process.env.BASE_URL as string, // Base URL for the application
};

export default appConfig;
