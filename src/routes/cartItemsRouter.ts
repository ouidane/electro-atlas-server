import express, { Router } from "express";
import {
  getItemById,
  addItemToCart,
  updateItemInCart,
  deleteItemFromCart,
  clearCart,
} from "../controllers/cartController";
import {
  authenticateUser,
  authorizeCartAccess,
} from "../middleware/premissions";

const router: Router = express.Router({ mergeParams: true });

router
  .route("/")
  .post(authenticateUser, authorizeCartAccess, addItemToCart)
  .delete(authenticateUser, authorizeCartAccess, clearCart);
router
  .route("/:itemId")
  .get(authenticateUser, authorizeCartAccess, getItemById)
  .patch(authenticateUser, authorizeCartAccess, updateItemInCart)
  .delete(authenticateUser, authorizeCartAccess, deleteItemFromCart);

export default router;
