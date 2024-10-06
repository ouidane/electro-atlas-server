"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productController_1 = require("../controllers/productController");
const premissions_1 = require("../middleware/premissions");
const multer_1 = require("../middleware/multer");
const constants_1 = require("../utils/constants");
const router = express_1.default.Router();
router
    .route("/")
    .get(productController_1.getAllProducts)
    .post(premissions_1.authenticateUser, (0, premissions_1.authorizePermissions)(constants_1.ROLE.ADMIN, constants_1.ROLE.SELLER), multer_1.uploadImages, productController_1.createProduct);
router
    .route("/:productId")
    .get(productController_1.getProductById)
    .patch(premissions_1.authenticateUser, (0, premissions_1.authorizePermissions)(constants_1.ROLE.ADMIN, constants_1.ROLE.SELLER), premissions_1.authorizeProductAccess, multer_1.uploadImages, productController_1.updateProduct)
    .delete(premissions_1.authenticateUser, (0, premissions_1.authorizePermissions)(constants_1.ROLE.ADMIN, constants_1.ROLE.SELLER), premissions_1.authorizeProductAccess, productController_1.deleteProduct);
exports.default = router;
//# sourceMappingURL=productRoutes.js.map