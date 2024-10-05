import express, { Router } from "express";
import {
  getAllProducts,
  createProduct,
  deleteProduct,
  getProductById,
  updateProduct,
} from "../controllers/productController";
import {
  authenticateUser,
  authorizePermissions,
  authorizeProductAccess,
} from "../middleware/premissions";
import { uploadImages } from "../middleware/multer";
import { ROLE } from "../utils/constants";

const router: Router = express.Router();

router
  .route("/")
  .get(getAllProducts)
  .post(
    authenticateUser,
    authorizePermissions(ROLE.ADMIN, ROLE.SELLER),
    uploadImages,
    createProduct
  );

router
  .route("/:productId")
  .get(getProductById)
  .patch(
    authenticateUser,
    authorizePermissions(ROLE.ADMIN, ROLE.SELLER),
    authorizeProductAccess,
    uploadImages,
    updateProduct
  )
  .delete(
    authenticateUser,
    authorizePermissions(ROLE.ADMIN, ROLE.SELLER),
    authorizeProductAccess,
    deleteProduct
  );

export default router;
