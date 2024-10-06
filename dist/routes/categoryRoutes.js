"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const categoryController_1 = require("../controllers/categoryController");
const premissions_1 = require("../middleware/premissions");
const multer_1 = require("../middleware/multer");
const constants_1 = require("../utils/constants");
const router = express_1.default.Router();
router
    .route("/parent")
    .get(categoryController_1.getParentCategories)
    .post(premissions_1.authenticateUser, (0, premissions_1.authorizePermissions)(constants_1.ROLE.ADMIN), multer_1.uploadSingleImage, categoryController_1.createParentCategory);
router
    .route("/parent/:parentCategoryId")
    .get(categoryController_1.getSingleParentCategory)
    .patch(premissions_1.authenticateUser, (0, premissions_1.authorizePermissions)(constants_1.ROLE.ADMIN), multer_1.uploadSingleImage, categoryController_1.updateParentCategory)
    .delete(premissions_1.authenticateUser, (0, premissions_1.authorizePermissions)(constants_1.ROLE.ADMIN), multer_1.uploadSingleImage, categoryController_1.deleteParentCategory);
router
    .route("/parent/:parentCategoryId/child")
    .get(categoryController_1.getChildCategories)
    .post(premissions_1.authenticateUser, (0, premissions_1.authorizePermissions)(constants_1.ROLE.ADMIN), multer_1.uploadSingleImage, categoryController_1.createChildCategory);
router
    .route("/parent/:parentCategoryId/child/:childCategoryId")
    .get(categoryController_1.getSingleChildCategory)
    .patch(premissions_1.authenticateUser, (0, premissions_1.authorizePermissions)(constants_1.ROLE.ADMIN), multer_1.uploadSingleImage, categoryController_1.updateChildCategory)
    .delete(premissions_1.authenticateUser, (0, premissions_1.authorizePermissions)(constants_1.ROLE.ADMIN), multer_1.uploadSingleImage, categoryController_1.deleteChildCategory);
exports.default = router;
//# sourceMappingURL=categoryRoutes.js.map