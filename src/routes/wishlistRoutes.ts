import express, { Router } from "express";
import { wishlistController } from "../controllers/wishlistController";
import {
  authenticateUser,
  authorizePermissions,
  authorizeWishlistAccess,
} from "../middlewares/premissions";
import { ROLE } from "../utils/constants";
import {
  validateAddItem,
  validateDeleteItem,
} from "../middlewares/validateWishlist";

const router: Router = express.Router();

router
  .route("/")
  .get(
    authenticateUser,
    authorizePermissions(ROLE.ADMIN),
    wishlistController.getWishlists
  );

router
  .route("/:wishlistId")
  .get(
    authenticateUser,
    authorizeWishlistAccess,
    wishlistController.getWishlistById
  )
  .post(
    authenticateUser,
    authorizeWishlistAccess,
    validateAddItem,
    wishlistController.addItemToWishlist
  )
  .delete(
    authenticateUser,
    authorizeWishlistAccess,
    validateDeleteItem,
    wishlistController.deleteItemFromWishlist
  );

export default router;
