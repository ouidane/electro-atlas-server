"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cartController_1 = require("../controllers/cartController");
const premissions_1 = require("../middleware/premissions");
const router = express_1.default.Router({ mergeParams: true });
router
    .route("/")
    .post(premissions_1.authenticateUser, premissions_1.authorizeCartAccess, cartController_1.addItemToCart)
    .delete(premissions_1.authenticateUser, premissions_1.authorizeCartAccess, cartController_1.clearCart);
router
    .route("/:itemId")
    .get(premissions_1.authenticateUser, premissions_1.authorizeCartAccess, cartController_1.getItemById)
    .patch(premissions_1.authenticateUser, premissions_1.authorizeCartAccess, cartController_1.updateItemInCart)
    .delete(premissions_1.authenticateUser, premissions_1.authorizeCartAccess, cartController_1.deleteItemFromCart);
exports.default = router;
//# sourceMappingURL=cartItemsRouter.js.map