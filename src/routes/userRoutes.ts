import express, { Router } from "express";
import {
  getCurrentUser,
  updateCurrentUser,
  getUsers,
  createUser,
  getUserById,
  updateUserById,
  deleteUserById,
} from "../controllers/userController";
import {
  authenticateUser,
  authorizePermissions,
} from "../middleware/premissions";
import { ROLE } from "../utils/constants";
import validateUser from "../middleware/validateUser";

const router: Router = express.Router();

router
  .route("/current/connect")
  .get(authenticateUser, getCurrentUser)
  .patch(authenticateUser, validateUser, updateCurrentUser);

router
  .route("/")
  .get(authenticateUser, authorizePermissions(ROLE.ADMIN), getUsers)
  .post(authenticateUser, authorizePermissions(ROLE.ADMIN), createUser);

router
  .route("/:userId")
  .get(authenticateUser, authorizePermissions(ROLE.ADMIN), getUserById)
  .patch(
    authenticateUser,
    authorizePermissions(ROLE.ADMIN),
    validateUser,
    updateUserById
  )
  .delete(authenticateUser, authorizePermissions(ROLE.ADMIN), deleteUserById);

export default router;
