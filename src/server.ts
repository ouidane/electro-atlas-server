require("express-async-errors");
import express, { Express, Request, Response } from "express";
import connectDB from "./config/dbConfig";
import { logger } from "./utils/logger";
import morganMiddleware from "./middlewares/morganMiddleware";
import corsMiddleware from "./middlewares/cors";
import sessionMiddleware from "./middlewares/session";
import platformMiddleware from "./middlewares/platformMiddleware";
import configurePassport from "./utils/passport";
import passport from "passport";
import rawBodyMiddleware from "./middlewares/rawBodyMiddleware";
import helmet from "helmet";
import limiter from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import swaggerUi from "swagger-ui-express";
import { swaggerConfig, swaggerUiOptions } from "./config/swaggerConfig";
import appConfig from "./config/appConfig";

// Middlewares ================================================================
const app: Express = express();

app.use(rawBodyMiddleware);
app.use(express.urlencoded({ extended: true }));
app.use(morganMiddleware);
app.use(corsMiddleware);
app.use(platformMiddleware);
app.use(sessionMiddleware);
if (appConfig.environment !== "dev") {
  app.set("trust proxy", 1);
  app.use(limiter({ windowMs: 15 * 60 * 1000, max: 90 }));
  app.use(helmet());
  app.use(mongoSanitize());
}

// Initialize Passport for authentication ==============================
app.use(passport.initialize());
app.use(passport.session());
configurePassport(passport);

// Setup Swagger UI ====================================================
app.use("/api-docs", swaggerUi.serve);
app.get("/api-docs", swaggerUi.setup(swaggerConfig, swaggerUiOptions));

// Routes ==============================================================
import authRouter from "./routes/authRoutes";
import userRouter from "./routes/userRoutes";
import productRouter from "./routes/productRoutes";
import reviewRoute from "./routes/reviewRoute";
import specialProductRoute from "./routes/specialProductRoute";
import categoryRouter from "./routes/categoryRoutes";
import navDataRoutes from "./routes/navDataRoutes";
import cartRouter from "./routes/cartRoutes";
import wishlistRouter from "./routes/wishlistRoutes";
import cartItemsRouter from "./routes/cartItemsRouter";
import orderRouter from "./routes/orderRoutes";
import paymentRouter from "./routes/paymentRouters";

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome! Please visit /api-docs for the API documentation.");
});
app.get("/api", (req: Request, res: Response) => {
  res.json({
    message: "Welcome to the API. Current available version is v1.",
    availableVersions: {
      v1: "/api/v1",
    },
    docs: "/api-docs",
  });
});
app.get("/api/v1", (req: Request, res: Response) => {
  res.json({
    message: "Welcome to API version 1. Available endpoints:",
    endpoints: {
      auth: "/api/v1/auth",
      users: "/api/v1/users",
      products: "/api/v1/products",
      categories: "/api/v1/categories",
      carts: "/api/v1/carts",
      wishlist: "/api/v1/wishlists",
      vavigationData: "/api/v1/nav-data",
      payment: "/api/v1/payment",
      orders: "/api/v1/orders",
      bestOffers: "/api/v1/best-offers",
      bestSeller: "/api/v1/best-seller",
      liveSearch: "/api/v1/live-search",
      recommendedProducts: "/api/v1/recommended-products",
      productFilters: "/api/v1/product-filters",
    },
    docs: "/api-docs",
  });
});
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/products/:productId/reviews", reviewRoute);
app.use("/api/v1/carts", cartRouter);
app.use("/api/v1/carts/:cartId/items", cartItemsRouter);
app.use("/api/v1/wishlists", wishlistRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/nav-data", navDataRoutes);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1", specialProductRoute);

// Handling errors ==============================================
import notFound from "./middlewares/notFound";
import errorHandler from "./middlewares/errorHandler";

app.use(notFound);
app.use(errorHandler);

// Connect to database ==========================================
const start = async () => {
  await connectDB();
  app.listen(appConfig.port, () => {
    logger.info(
      `${appConfig.appName} running in ${appConfig.environment} mode on port ${appConfig.port}`
    );
  });
};

start();
