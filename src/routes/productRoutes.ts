import express, { Router } from "express";
import { productController } from "../controllers/productController";
import {
  authenticateUser,
  authorizePermissions,
  authorizeProductAccess,
} from "../middlewares/premissions";
import { uploadImages } from "../middlewares/multer";
import { ROLE } from "../utils/constants";
import {
  validateProduct,
  validateUpdateProduct,
} from "../middlewares/validateProduct";

const router: Router = express.Router();

router
  .route("/")
  .get(productController.getAllProducts)
  .post(
    authenticateUser,
    authorizePermissions(ROLE.ADMIN, ROLE.SELLER),
    validateProduct,
    uploadImages,
    productController.createProduct
  );

router
  .route("/:productId")
  .get(productController.getProductById)
  .patch(
    authenticateUser,
    authorizePermissions(ROLE.ADMIN, ROLE.SELLER),
    authorizeProductAccess,
    validateUpdateProduct,
    uploadImages,
    productController.updateProduct
  )
  .delete(
    authenticateUser,
    authorizePermissions(ROLE.ADMIN, ROLE.SELLER),
    authorizeProductAccess,
    productController.deleteProduct
  );

export default router;
