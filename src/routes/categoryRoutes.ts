import express, { Router } from "express";
import { categoryController } from "../controllers/categoryController";
import {
  authenticateUser,
  authorizePermissions,
} from "../middlewares/premissions";
import { uploadSingleImage } from "../middlewares/multer";
import { ROLE } from "../utils/constants";

const router: Router = express.Router();

router
  .route("/parent")
  .get(categoryController.getParentCategories)
  .post(
    authenticateUser,
    authorizePermissions(ROLE.ADMIN),
    uploadSingleImage,
    categoryController.createParentCategory
  );
router
  .route("/parent/:parentCategoryId")
  .get(categoryController.getSingleParentCategory)
  .patch(
    authenticateUser,
    authorizePermissions(ROLE.ADMIN),
    uploadSingleImage,
    categoryController.updateParentCategory
  )
  .delete(
    authenticateUser,
    authorizePermissions(ROLE.ADMIN),
    uploadSingleImage,
    categoryController.deleteParentCategory
  );
router
  .route("/parent/:parentCategoryId/child")
  .get(categoryController.getChildCategories)
  .post(
    authenticateUser,
    authorizePermissions(ROLE.ADMIN),
    uploadSingleImage,
    categoryController.createChildCategory
  );
router
  .route("/parent/:parentCategoryId/child/:childCategoryId")
  .get(categoryController.getSingleChildCategory)
  .patch(
    authenticateUser,
    authorizePermissions(ROLE.ADMIN),
    uploadSingleImage,
    categoryController.updateChildCategory
  )
  .delete(
    authenticateUser,
    authorizePermissions(ROLE.ADMIN),
    uploadSingleImage,
    categoryController.deleteChildCategory
  );

export default router;
