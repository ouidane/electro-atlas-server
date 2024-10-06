import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { CartItem, Cart, Product } from "../models";
import { buildSortOption } from "../utils/sortHandler";

// Get carts ================================================================
const getCarts = async (req: Request, res: Response, next: NextFunction) => {
  const {
    limit = 10,
    page = 1,
    minAmount,
    maxAmount,
    minTotalProducts,
    maxTotalProducts,
    minTotalItems,
    maxTotalItems,
    sort = "createdAt",
  } = req.query;

  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);
  const skip = (pageNumber - 1) * limitNumber;

  // Build the query object
  const query: any = {};

  if (minAmount) query.amount = { ...query.amount, $gte: Number(minAmount) };
  if (maxAmount) query.amount = { ...query.amount, $lte: Number(maxAmount) };
  if (minTotalProducts)
    query.totalProducts = {
      ...query.totalProducts,
      $gte: Number(minTotalProducts),
    };
  if (maxTotalProducts)
    query.totalProducts = {
      ...query.totalProducts,
      $lte: Number(maxTotalProducts),
    };
  if (minTotalItems)
    query.totalItems = { ...query.totalItems, $gte: Number(minTotalItems) };
  if (maxTotalItems)
    query.totalItems = { ...query.totalItems, $lte: Number(maxTotalItems) };

  // Sorting logic
  const AllowedSortFields = {
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    amount: "amount",
    totalProducts: "totalProducts",
    totalItems: "totalItems",
  };
  const sortOptions = buildSortOption(sort as string, AllowedSortFields);

  // Fetch carts with pagination and sorting
  const carts = await Cart.find(query)
    .select("userId totalProducts totalItems amount createdAt updatedAt")
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNumber)
    .lean();

  if (!carts || carts.length === 0) {
    return next(createError(404, "Carts not found"));
  }

  // Get total count for pagination
  const totalCount = await Cart.countDocuments(query);

  res.status(200).json({
    carts,
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / limitNumber),
      totalCount,
      limit: limitNumber,
    },
  });
};

// Get Cart By Id ================================================================
const getCartById = async (req: Request, res: Response, next: NextFunction) => {
  const { cartId } = req.params;

  const cart = await Cart.findById(cartId).select("-__v").lean();
  if (!cart) {
    return next(createError(404, "Cart not found"));
  }

  const cartItems = await CartItem.getFormattedCartItems(cart._id);

  res.status(200).json({ cart: { ...cart, cartItems } });
};

// Get Item By Id ================================================================
const getItemById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { cartId, itemId } = req.params;

  const item = await CartItem.findOne({ cartId, _id: itemId })
    .select("-__v")
    .lean();
  if (!item) {
    return next(createError(404, "Item not found"));
  }

  res.status(200).json({ item });
};

// Add item to cart ================================================================
const addItemToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { cartId } = req.params;
  const { productId, sku, quantity = 1 } = req.body;

  const product = await Product.findById(productId).lean();
  if (!product) {
    return next(createError(404, "Product not found"));
  }
  const variant = product.variants.find((variant) => variant.sku === sku);
  if (!variant) {
    return next(createError(404, "Product variant not found"));
  }

  const item = await CartItem.findOne({ cartId, productId, sku });

  if (item) {
    item.quantity += quantity;
    await item.save();
  } else {
    await CartItem.create({ quantity, cartId, productId, sku });
  }

  await Cart.updateCart(cartId);

  res.status(201).json({ message: "Cart item added successfully" });
};

// Update item in cart ================================================================
const updateItemInCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { cartId, itemId } = req.params;
  const quantity = Number(req.body.quantity);

  const item = await CartItem.findOne({ cartId, _id: itemId });
  if (!item) {
    return next(createError(404, "Item not found"));
  }

  if (quantity === 0) {
    await CartItem.findByIdAndDelete(item._id);
  } else {
    item.quantity = quantity;
    await item.save();
  }

  await Cart.updateCart(cartId);

  res.status(200).json({ message: "Cart item updated successfully" });
};

// Delete item in cart ================================================================
const deleteItemFromCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { cartId, itemId } = req.params;

  const item = await CartItem.findOneAndDelete({ cartId, _id: itemId });
  if (!item) {
    return next(createError(404, "Item not found"));
  }

  await Cart.updateCart(cartId);

  res.status(200).json({ message: "Cart item deleted successfully" });
};

// Delete all items in cart ================================================================
const clearCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { cartId } = req.params;

  await CartItem.deleteMany({ cartId });

  await Cart.updateCart(cartId);

  res.status(200).json({ message: "Cart is cleared successfully" });
};

export {
  getCarts,
  getCartById,
  getItemById,
  addItemToCart,
  updateItemInCart,
  deleteItemFromCart,
  clearCart,
};
