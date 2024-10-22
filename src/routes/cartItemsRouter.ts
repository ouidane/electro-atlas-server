import express, { Router } from "express";
import { cartController } from "../controllers/cartController";
import {
  authenticateUser,
  authorizeCartAccess,
} from "../middlewares/premissions";

const router: Router = express.Router({ mergeParams: true });

router
  .route("/")
  .post(authenticateUser, authorizeCartAccess, cartController.addItemToCart)
  .delete(authenticateUser, authorizeCartAccess, cartController.clearCart);
router
  .route("/:itemId")
  .get(authenticateUser, authorizeCartAccess, cartController.getItemById)
  .patch(authenticateUser, authorizeCartAccess, cartController.updateItemInCart)
  .delete(
    authenticateUser,
    authorizeCartAccess,
    cartController.deleteItemFromCart
  );

export default router;
