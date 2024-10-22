export const authConfig = {
  jwtSecret: process.env.JWT_SECRET || "your-jwt-secret",
  jwtExpiration: process.env.JWT_EXPIRATION || "1h",

  googleMarketplace: {
    clientId: process.env.GOOGLE_MARKETPLACE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_MARKETPLACE_CLIENT_SECRET || "",
    redirectUri: `${process.env.BASE_URL}/api/auth/google/marketplace/callback`,
  },

  googleVendor: {
    clientId: process.env.GOOGLE_VENDOR_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_VENDOR_CLIENT_SECRET || "",
    redirectUri: `${process.env.BASE_URL}/api/auth/google/vendor/callback`,
  },

  passwordPolicy: {
    minLength: 8,
    requireNumbers: true,
    requireSpecialCharacters: true,
  },
};
