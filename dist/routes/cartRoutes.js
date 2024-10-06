"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cartController_1 = require("../controllers/cartController");
const premissions_1 = require("../middleware/premissions");
const constants_1 = require("../utils/constants");
const router = express_1.default.Router();
router
    .route("/")
    .get(premissions_1.authenticateUser, (0, premissions_1.authorizePermissions)(constants_1.ROLE.ADMIN), cartController_1.getCarts);
router
    .route("/:cartId")
    .get(premissions_1.authenticateUser, premissions_1.authorizeCartAccess, cartController_1.getCartById);
router
    .route("/:cartId/items")
    .post(premissions_1.authenticateUser, premissions_1.authorizeCartAccess, cartController_1.addItemToCart)
    .delete(premissions_1.authenticateUser, premissions_1.authorizeCartAccess, cartController_1.clearCart);
router
    .route("/:cartId/items/:itemId")
    .get(premissions_1.authenticateUser, premissions_1.authorizeCartAccess, cartController_1.getItemById)
    .patch(premissions_1.authenticateUser, premissions_1.authorizeCartAccess, cartController_1.updateItemInCart)
    .delete(premissions_1.authenticateUser, premissions_1.authorizeCartAccess, cartController_1.deleteItemFromCart);
exports.default = router;
//# sourceMappingURL=cartRoutes.js.map