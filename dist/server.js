"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("express-async-errors");
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const connectMongo_1 = __importDefault(require("./db/connectMongo"));
const logger_1 = require("./utils/logger");
const cors_1 = __importDefault(require("cors"));
const cors_2 = __importDefault(require("./utils/cors"));
const session_1 = __importDefault(require("./middleware/session"));
const platformMiddleware_1 = __importDefault(require("./middleware/platformMiddleware"));
const passport_1 = __importDefault(require("./utils/passport"));
const passport_2 = __importDefault(require("passport"));
const rawBodyMiddleware_1 = __importDefault(require("./middleware/rawBodyMiddleware"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swaggerConfig_1 = require("./utils/swaggerConfig");
// Middlewares ================================================================
dotenv_1.default.config();
const app = (0, express_1.default)();
// Setup Swagger UI
app.use("/api-docs", swagger_ui_express_1.default.serve);
app.get("/api-docs", swagger_ui_express_1.default.setup(swaggerConfig_1.swaggerConfig, swaggerConfig_1.swaggerUiOptions));
// Serve raw Swagger document
app.get("/swagger.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerConfig_1.swaggerConfig);
});
app.use(rawBodyMiddleware_1.default);
// app.use(express.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(logger_1.morganMiddleware);
app.use((0, cors_1.default)(cors_2.default));
app.use(platformMiddleware_1.default);
if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
    app.use((0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000,
        max: 90,
    }));
    app.use((0, helmet_1.default)());
    app.use((0, express_mongo_sanitize_1.default)());
}
app.use(session_1.default);
// Initialize Passport for authentication ====================================================
app.use(passport_2.default.initialize());
app.use(passport_2.default.session());
(0, passport_1.default)(passport_2.default);
// Routes ====================================================================================
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const reviewRoute_1 = __importDefault(require("./routes/reviewRoute"));
const specialProductRoute_1 = __importDefault(require("./routes/specialProductRoute"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const navDataRoutes_1 = __importDefault(require("./routes/navDataRoutes"));
const cartRoutes_1 = __importDefault(require("./routes/cartRoutes"));
const wishlistRoutes_1 = __importDefault(require("./routes/wishlistRoutes"));
const cartItemsRouter_1 = __importDefault(require("./routes/cartItemsRouter"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const paymentRouters_1 = __importDefault(require("./routes/paymentRouters"));
app.use("/api/v1/auth", authRoutes_1.default);
app.use("/api/v1/users", userRoutes_1.default);
app.use("/api/v1/products", productRoutes_1.default);
app.use("/api/v1/products/:productId/reviews", reviewRoute_1.default);
app.use("/api/v1/carts", cartRoutes_1.default);
app.use("/api/v1/carts/:cartId/items", cartItemsRouter_1.default);
app.use("/api/v1/wishlists", wishlistRoutes_1.default);
app.use("/api/v1/categories", categoryRoutes_1.default);
app.use("/api/v1/nav-data", navDataRoutes_1.default);
app.use("/api/v1/payment", paymentRouters_1.default);
app.use("/api/v1/orders", orderRoutes_1.default);
app.use("/api/v1", specialProductRoute_1.default);
// Handling errors ===========================================================================
const notFound_1 = __importDefault(require("./middleware/notFound"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
app.use(notFound_1.default);
app.use(errorHandler_1.default);
// Connect to database ========================================================================
const port = process.env.PORT || 5000;
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    const mongodbUrl = process.env.MONGO_URI;
    yield (0, connectMongo_1.default)(mongodbUrl);
    app.listen(port, () => logger_1.logger.info(`Server is running on port ${port}`));
});
start();
//# sourceMappingURL=server.js.map