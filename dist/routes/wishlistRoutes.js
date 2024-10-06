"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const wishlistController_1 = require("../controllers/wishlistController");
const premissions_1 = require("../middleware/premissions");
const constants_1 = require("../utils/constants");
const router = express_1.default.Router();
router
    .route("/")
    .get(premissions_1.authenticateUser, (0, premissions_1.authorizePermissions)(constants_1.ROLE.ADMIN), wishlistController_1.getWishlists);
router
    .route("/:wishlistId")
    .get(premissions_1.authenticateUser, premissions_1.authorizeWishlistAccess, wishlistController_1.getWishlistById)
    .post(premissions_1.authenticateUser, premissions_1.authorizeWishlistAccess, wishlistController_1.addItemToWishlist)
    .delete(premissions_1.authenticateUser, premissions_1.authorizeWishlistAccess, wishlistController_1.deleteItemFromWishlist);
exports.default = router;
//# sourceMappingURL=wishlistRoutes.js.map