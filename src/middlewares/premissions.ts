import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { ROLE } from "../utils/constants";
import { Order, Wishlist, Cart, Product, Review } from "../models";

// Is authenticated ================================================================
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    return next(createError(401, "Access Denied"));
  }
};

export const authorizePermissions = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user.role;

    if (!roles.includes(userRole)) {
      return next(createError(403, "Unauthorized to access this route"));
    }

    next();
  };
};

const authorizeResourceAccess = (
  resourceName: string,
  Model: any,
  idField: string
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const resourceId = req.params[`${resourceName.toLowerCase()}Id`];
    const { id, role } = req.user;

    if (role === ROLE.ADMIN) return next();

    const resource = await Model.findById(resourceId).lean();
    if (!resource) return next(createError(404, `${resourceName} not found`));

    if (resource[idField].toString() !== id.toString()) {
      return next(
        createError(403, `Unauthorized to access this ${resourceName}`)
      );
    }

    next();
  };
};

export const authorizeCartAccess = authorizeResourceAccess(
  "Cart",
  Cart,
  "userId"
);
export const authorizeProductAccess = authorizeResourceAccess(
  "Product",
  Product,
  "sellerId"
);
export const authorizeReviewAccess = authorizeResourceAccess(
  "Review",
  Review,
  "userId"
);
export const authorizeWishlistAccess = authorizeResourceAccess(
  "Wishlist",
  Wishlist,
  "userId"
);
export const authorizeOrderAccess = authorizeResourceAccess(
  "Order",
  Order,
  "userId"
);
