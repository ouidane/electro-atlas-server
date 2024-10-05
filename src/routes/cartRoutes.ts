import express, { Router } from "express";
import {
  getCarts,
  getCartById,
  getItemById,
  addItemToCart,
  updateItemInCart,
  deleteItemFromCart,
  clearCart,
} from "../controllers/cartController";
import {
  authenticateUser,
  authorizePermissions,
  authorizeCartAccess,
} from "../middleware/premissions";
import { ROLE } from "../utils/constants";

const router: Router = express.Router();

router
  .route("/")
  .get(authenticateUser, authorizePermissions(ROLE.ADMIN), getCarts);
router
  .route("/:cartId")
  .get(authenticateUser, authorizeCartAccess, getCartById);
router
  .route("/:cartId/items")
  .post(authenticateUser, authorizeCartAccess, addItemToCart)
  .delete(authenticateUser, authorizeCartAccess, clearCart);
router
  .route("/:cartId/items/:itemId")
  .get(authenticateUser, authorizeCartAccess, getItemById)
  .patch(authenticateUser, authorizeCartAccess, updateItemInCart)
  .delete(authenticateUser, authorizeCartAccess, deleteItemFromCart);

export default router;
