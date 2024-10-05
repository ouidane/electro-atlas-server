import express, { Router } from "express";
import {
  authenticateUser,
  authorizeOrderAccess,
  authorizePermissions,
} from "../middleware/premissions";
import {
  getBuyerOrders,
  getAllOrders,
  getOrderById,
} from "../controllers/orderController";
import { ROLE } from "../utils/constants";

const router: Router = express.Router();

router
  .route("/")
  .get(authenticateUser, authorizePermissions(ROLE.ADMIN), getAllOrders);

router.route("/buyer/connect").get(authenticateUser, getBuyerOrders);

router
  .route("/:orderId")
  .get(authenticateUser, authorizeOrderAccess, getOrderById);

export default router;
