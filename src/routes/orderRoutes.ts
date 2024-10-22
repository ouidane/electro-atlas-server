import express, { Router } from "express";
import {
  authenticateUser,
  authorizeOrderAccess,
  authorizePermissions,
} from "../middlewares/premissions";
import { orderController } from "../controllers/orderController";
import { ROLE } from "../utils/constants";

const router: Router = express.Router();

router
  .route("/")
  .get(
    authenticateUser,
    authorizePermissions(ROLE.ADMIN),
    orderController.getAllOrders
  );

router
  .route("/buyer/connect")
  .get(authenticateUser, orderController.getBuyerOrders);

router
  .route("/:orderId")
  .get(authenticateUser, authorizeOrderAccess, orderController.getOrderById);

export default router;
