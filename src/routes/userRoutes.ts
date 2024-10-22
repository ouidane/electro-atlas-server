import express, { Router } from "express";
import { userController } from "../controllers/userController";
import {
  authenticateUser,
  authorizePermissions,
} from "../middlewares/premissions";
import { ROLE } from "../utils/constants";
import validateUser from "../middlewares/validateUser";

const router: Router = express.Router();

router
  .route("/current/connect")
  .get(authenticateUser, userController.getCurrentUser)
  .patch(authenticateUser, validateUser, userController.updateCurrentUser);

router
  .route("/")
  .get(
    authenticateUser,
    authorizePermissions(ROLE.ADMIN),
    userController.getUsers
  )
  .post(
    authenticateUser,
    authorizePermissions(ROLE.ADMIN),
    userController.createUser
  );

router
  .route("/:userId")
  .get(
    authenticateUser,
    authorizePermissions(ROLE.ADMIN),
    userController.getUserById
  )
  .patch(
    authenticateUser,
    authorizePermissions(ROLE.ADMIN),
    validateUser,
    userController.updateUserById
  )
  .delete(
    authenticateUser,
    authorizePermissions(ROLE.ADMIN),
    userController.deleteUserById
  );

export default router;
