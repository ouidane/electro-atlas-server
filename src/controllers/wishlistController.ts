import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { Wishlist, Product } from "../models";

// Get wishlists ================================================================
const getWishlists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user.id;
  const { page = "1", limit = "10" } = req.query;

  const pageNumber = parseInt(page as string, 10) || 1;
  const limitNumber = parseInt(limit as string, 10) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  const wishlists = await Wishlist.find({ userId })
    .populate({
      path: "items.product",
      select: "_id name images variants",
    })
    .sort({ createdAt: "desc" })
    .skip(skip)
    .limit(limitNumber)
    .lean();

  const totalCount = await Wishlist.countDocuments({ userId });

  const formattedWishlists = wishlists.map((wishlist) => ({
    userId: wishlist.userId,
    itemsCount: wishlist.items.length,
    items: wishlist.items.map((item: any) => {
      const variant = item.product.variants.find(
        (v: any) => v.sku === item.sku
      );
      return {
        productId: item.product._id,
        productName: item.product.name,
        globalPrice: variant?.globalPrice,
        salePrice: variant?.salePrice,
        sku: item.sku,
        image: item.product.images[0]?.tiny,
        sellerId: item.product.sellerId,
        variation: variant.variation,
      };
    }),
  }));

  res.status(200).json({
    wishlists: formattedWishlists,
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / limitNumber),
      totalCount,
      limit: limitNumber,
    },
  });
};

// Get Wishlist By Id ================================================================
const getWishlistById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { wishlistId } = req.params;

  const wishlist = await Wishlist.findById(wishlistId)
    .populate({
      path: "items.product",
      select: "_id name images variants",
    })
    .lean();

  if (!wishlist) {
    return next(createError(404, "Wishlist not found"));
  }

  const formattedItems = wishlist.items.map((item: any) => {
    const variant = item.product.variants.find((v: any) => v.sku === item.sku);
    return {
      wishlistId: wishlistId,
      productId: item.product._id,
      productName: item.product.name,
      image: item.product.images[0]?.tiny,
      sellerId: item.product.sellerId,
      variant: variant,
    };
  });

  res.status(200).json({
    wishlist: {
      wishlistId: wishlist._id,
      userId: wishlist.userId,
      itemsCount: wishlist.items.length,
      items: formattedItems,
    },
  });
};

// Add item to wishlist ================================================================
const addItemToWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { wishlistId } = req.params;
  const { productId, sku } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    return next(createError(404, "Product not found"));
  }

  const variant = product.variants.find((v) => v.sku === sku);
  if (!variant) {
    return next(createError(404, "Product variant not found"));
  }

  const wishlist = await Wishlist.findById(wishlistId);
  if (!wishlist) {
    return next(createError(404, "Wishlist not found"));
  }

  if (wishlist.items.some((item) => item.sku === sku)) {
    return next(createError(409, "Product variant already in wishlist"));
  }

  wishlist.items.push({
    product: product._id,
    sku: sku,
  });
  await wishlist.save();

  res.status(201).json({ message: "Item added to wishlist successfully" });
};

// Delete item from wishlist =============================================
const deleteItemFromWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { wishlistId } = req.params;
  const { productId, sku } = req.body;

  const wishlist = await Wishlist.findById(wishlistId);
  if (!wishlist) {
    return next(createError(404, "Wishlist not found"));
  }

  const itemIndex = wishlist.items.findIndex(
    (item) => item.sku === sku && item.product.toString() === productId
  );
  if (itemIndex === -1) {
    return next(createError(404, "Item not found in wishlist"));
  }

  wishlist.items.splice(itemIndex, 1);
  await wishlist.save();

  res.status(200).json({ message: "Item deleted from wishlist successfully" });
};

export {
  getWishlists,
  getWishlistById,
  addItemToWishlist,
  deleteItemFromWishlist,
};
