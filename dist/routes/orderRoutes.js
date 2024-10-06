"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const premissions_1 = require("../middleware/premissions");
const orderController_1 = require("../controllers/orderController");
const constants_1 = require("../utils/constants");
const router = express_1.default.Router();
router
    .route("/")
    .get(premissions_1.authenticateUser, (0, premissions_1.authorizePermissions)(constants_1.ROLE.ADMIN), orderController_1.getAllOrders);
router.route("/buyer/connect").get(premissions_1.authenticateUser, orderController_1.getBuyerOrders);
router
    .route("/:orderId")
    .get(premissions_1.authenticateUser, premissions_1.authorizeOrderAccess, orderController_1.getOrderById);
exports.default = router;
//# sourceMappingURL=orderRoutes.js.map