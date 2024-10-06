"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const premissions_1 = require("../middleware/premissions");
const constants_1 = require("../utils/constants");
const validateUser_1 = __importDefault(require("../middleware/validateUser"));
const router = express_1.default.Router();
router
    .route("/current/connect")
    .get(premissions_1.authenticateUser, userController_1.getCurrentUser)
    .patch(premissions_1.authenticateUser, validateUser_1.default, userController_1.updateCurrentUser);
router
    .route("/")
    .get(premissions_1.authenticateUser, (0, premissions_1.authorizePermissions)(constants_1.ROLE.ADMIN), userController_1.getUsers)
    .post(premissions_1.authenticateUser, (0, premissions_1.authorizePermissions)(constants_1.ROLE.ADMIN), userController_1.createUser);
router
    .route("/:userId")
    .get(premissions_1.authenticateUser, (0, premissions_1.authorizePermissions)(constants_1.ROLE.ADMIN), userController_1.getUserById)
    .patch(premissions_1.authenticateUser, (0, premissions_1.authorizePermissions)(constants_1.ROLE.ADMIN), validateUser_1.default, userController_1.updateUserById)
    .delete(premissions_1.authenticateUser, (0, premissions_1.authorizePermissions)(constants_1.ROLE.ADMIN), userController_1.deleteUserById);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map