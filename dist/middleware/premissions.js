"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeOrderAccess = exports.authorizeWishlistAccess = exports.authorizeReviewAccess = exports.authorizeProductAccess = exports.authorizeCartAccess = exports.authorizePermissions = exports.authenticateUser = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const constants_1 = require("../utils/constants");
const models_1 = require("../models");
// Is authenticated ================================================================
const authenticateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.isAuthenticated()) {
        next();
    }
    else {
        return next((0, http_errors_1.default)(401, "Access Denied"));
    }
});
exports.authenticateUser = authenticateUser;
const authorizePermissions = (...roles) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const userRole = req.user.role;
        if (!roles.includes(userRole)) {
            return next((0, http_errors_1.default)(403, "Unauthorized to access this route"));
        }
        next();
    });
};
exports.authorizePermissions = authorizePermissions;
const authorizeResourceAccess = (resourceName, Model, idField) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const resourceId = req.params[`${resourceName.toLowerCase()}Id`];
        const { id, role } = req.user;
        if (role === constants_1.ROLE.ADMIN)
            return next();
        const resource = yield Model.findById(resourceId).lean();
        if (!resource)
            return next((0, http_errors_1.default)(404, `${resourceName} not found`));
        if (resource[idField].toString() !== id.toString()) {
            return next((0, http_errors_1.default)(403, `Unauthorized to access this ${resourceName}`));
        }
        next();
    });
};
exports.authorizeCartAccess = authorizeResourceAccess("Cart", models_1.Cart, "userId");
exports.authorizeProductAccess = authorizeResourceAccess("Product", models_1.Product, "sellerId");
exports.authorizeReviewAccess = authorizeResourceAccess("Review", models_1.Review, "userId");
exports.authorizeWishlistAccess = authorizeResourceAccess("Wishlist", models_1.Wishlist, "userId");
exports.authorizeOrderAccess = authorizeResourceAccess("Order", models_1.Order, "userId");
//# sourceMappingURL=premissions.js.map