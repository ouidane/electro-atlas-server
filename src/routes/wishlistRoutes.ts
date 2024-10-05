import express, { Router } from "express";
import {
  getWishlists,
  getWishlistById,
  addItemToWishlist,
  deleteItemFromWishlist,
} from "../controllers/wishlistController";
import {
  authenticateUser,
  authorizePermissions,
  authorizeWishlistAccess,
} from "../middleware/premissions";
import { ROLE } from "../utils/constants";

const router: Router = express.Router();

router
  .route("/")
  .get(authenticateUser, authorizePermissions(ROLE.ADMIN), getWishlists);

router
  .route("/:wishlistId")
  .get(authenticateUser, authorizeWishlistAccess, getWishlistById)
  .post(authenticateUser, authorizeWishlistAccess, addItemToWishlist)
  .delete(authenticateUser, authorizeWishlistAccess, deleteItemFromWishlist);

export default router;
