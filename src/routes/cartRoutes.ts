import express, { Router } from "express";
import { cartController } from "../controllers/cartController";
import {
  authenticateUser,
  authorizePermissions,
  authorizeCartAccess,
} from "../middlewares/premissions";
import { ROLE } from "../utils/constants";

const router: Router = express.Router();

router
  .route("/")
  .get(
    authenticateUser,
    authorizePermissions(ROLE.ADMIN),
    cartController.getCarts
  );
router
  .route("/:cartId")
  .get(authenticateUser, authorizeCartAccess, cartController.getCartById);
router
  .route("/:cartId/items")
  .post(authenticateUser, authorizeCartAccess, cartController.addItemToCart)
  .delete(authenticateUser, authorizeCartAccess, cartController.clearCart);
router
  .route("/:cartId/items/:itemId")
  .get(authenticateUser, authorizeCartAccess, cartController.getItemById)
  .patch(authenticateUser, authorizeCartAccess, cartController.updateItemInCart)
  .delete(
    authenticateUser,
    authorizeCartAccess,
    cartController.deleteItemFromCart
  );

export default router;
