import express, { Router } from "express";
import {
  getParentCategories,
  getSingleParentCategory,
  createParentCategory,
  updateParentCategory,
  deleteParentCategory,
  getChildCategories,
  getSingleChildCategory,
  createChildCategory,
  updateChildCategory,
  deleteChildCategory,
} from "../controllers/categoryController";
import {
  authenticateUser,
  authorizePermissions,
} from "../middleware/premissions";
import { uploadSingleImage } from "../middleware/multer";
import { ROLE } from "../utils/constants";

const router: Router = express.Router();

router
  .route("/parent")
  .get(getParentCategories)
  .post(
    authenticateUser,
    authorizePermissions(ROLE.ADMIN),
    uploadSingleImage,
    createParentCategory
  );
router
  .route("/parent/:parentCategoryId")
  .get(getSingleParentCategory)
  .patch(
    authenticateUser,
    authorizePermissions(ROLE.ADMIN),
    uploadSingleImage,
    updateParentCategory
  )
  .delete(
    authenticateUser,
    authorizePermissions(ROLE.ADMIN),
    uploadSingleImage,
    deleteParentCategory
  );
router
  .route("/parent/:parentCategoryId/child")
  .get(getChildCategories)
  .post(
    authenticateUser,
    authorizePermissions(ROLE.ADMIN),
    uploadSingleImage,
    createChildCategory
  );
router
  .route("/parent/:parentCategoryId/child/:childCategoryId")
  .get(getSingleChildCategory)
  .patch(
    authenticateUser,
    authorizePermissions(ROLE.ADMIN),
    uploadSingleImage,
    updateChildCategory
  )
  .delete(
    authenticateUser,
    authorizePermissions(ROLE.ADMIN),
    uploadSingleImage,
    deleteChildCategory
  );

export default router;
