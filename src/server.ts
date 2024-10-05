import "express-async-errors";
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import connectDB from "./db/connectMongo";
import { logger, morganMiddleware } from "./utils/logger";
import cors from "cors";
import corsOptions from "./utils/cors";
import session from "./middleware/session";
import platformMiddleware from "./middleware/platformMiddleware";
import configurePassport from "./utils/passport";
import passport from "passport";
import rawBodyMiddleware from "./middleware/rawBodyMiddleware";
import helmet from "helmet";
import limiter from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import swaggerUi from "swagger-ui-express";
import { swaggerConfig, swaggerUiOptions } from "./utils/swaggerConfig";

// Middlewares ================================================================
dotenv.config();
const app: Express = express();

// Setup Swagger UI
app.use("/api-docs", swaggerUi.serve);
app.get("/api-docs", swaggerUi.setup(swaggerConfig, swaggerUiOptions));

// Serve raw Swagger document
app.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerConfig);
});

app.use(rawBodyMiddleware);
// app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morganMiddleware);
app.use(cors(corsOptions));
app.use(platformMiddleware);
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
  app.use(
    limiter({
      windowMs: 15 * 60 * 1000,
      max: 90,
    })
  );
  app.use(helmet());
  app.use(mongoSanitize());
}
app.use(session);

// Initialize Passport for authentication ====================================================
app.use(passport.initialize());
app.use(passport.session());
configurePassport(passport);

// Routes ====================================================================================
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

// Handling errors ===========================================================================
import notFound from "./middleware/notFound";
import errorHandler from "./middleware/errorHandler";

app.use(notFound);
app.use(errorHandler);

// Connect to database ========================================================================

const port = process.env.PORT || 5000;
const start = async () => {
  const mongodbUrl = process.env.MONGO_URI as string;

  await connectDB(mongodbUrl);
  app.listen(port, () => logger.info(`Server is running on port ${port}`));
};

start();
