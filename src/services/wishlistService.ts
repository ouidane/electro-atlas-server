import { Types } from "mongoose";
import createError from "http-errors";
import { Wishlist, Product } from "../models";
import { ProductVariantsDoc } from "../models/productVariantsModel";
import { WishlistItemDoc } from "../models/wishlistModel";
import { ProductDoc } from "../models/productModel";

export class WishlistService {
   async getWishlists(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const wishlists = await Wishlist.find({ userId })
      .populate({
        path: "items.product",
        select: "_id name images variants",
      })
      .sort({ createdAt: "desc" })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalCount = await Wishlist.countDocuments({ userId });

    const formattedWishlists = wishlists.map((wishlist) => ({
      userId: wishlist.userId,
      itemsCount: wishlist.items.length,
      items: wishlist.items.map((item: WishlistItemDoc) => {
        const product = item.product as ProductDoc;
        const variant = product.variants.find(
          (v: ProductVariantsDoc) => v.sku === item.sku
        );
        return {
          productId: product._id,
          productName: product.name,
          image: product.images?.[0].tiny,
          sellerId: product.sellerId,
          variant: variant,
        };
      }),
    }));

    return {
      wishlists: formattedWishlists,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
      },
    };
  }

   async getWishlistById(wishlistId: string) {
    const wishlist = await Wishlist.findById(wishlistId)
      .populate({
        path: "items.product",
        select: "_id name images variants",
      })
      .lean();

    if (!wishlist) {
      throw createError(404, "Wishlist not found");
    }

    const formattedItems = wishlist.items.map((item: WishlistItemDoc) => {
      const product = item.product as ProductDoc;
      const variant = product.variants.find(
        (v: ProductVariantsDoc) => v.sku === item.sku
      );
      return {
        wishlistId: wishlistId,
        productId: product._id,
        productName: product.name,
        image: product.images?.[0].tiny,
        sellerId: product.sellerId,
        variant: variant,
      };
    });

    return {
      wishlistId: wishlist._id,
      userId: wishlist.userId,
      itemsCount: wishlist.items.length,
      items: formattedItems,
    };
  }

   async addItemToWishlist(wishlistId: string, productId: string, sku: string) {
    const product = await Product.findById(productId);
    if (!product) {
      throw createError(404, "Product not found");
    }

    const variant = product.variants.find((v) => v.sku === sku);
    if (!variant) {
      throw createError(404, "Product variant not found");
    }

    const wishlist = await Wishlist.findById(wishlistId);
    if (!wishlist) {
      throw createError(404, "Wishlist not found");
    }

    if (wishlist.items.some((item) => item.sku === sku)) {
      throw createError(409, "Product variant already in wishlist");
    }

    wishlist.items.push({
      product: product._id,
      sku: sku,
    });
    await wishlist.save();
  }

   async deleteItemFromWishlist(wishlistId: string, productId: string, sku: string) {
    const wishlist = await Wishlist.findById(wishlistId);
    if (!wishlist) {
      throw createError(404, "Wishlist not found");
    }

    const itemIndex = wishlist.items.findIndex(
      (item) => item.sku === sku && item.product.toString() === productId
    );
    if (itemIndex === -1) {
      throw createError(404, "Item not found in wishlist");
    }

    wishlist.items.splice(itemIndex, 1);
    await wishlist.save();
  }

   async addWishlistToDatabase(items: any[],userId: unknown) {
        const wishlist = await Wishlist.create({ userId });
      
        if (!items || items.length === 0) {
          return;
        }
      
        for (const item of items) {
          const product = await Product.findById(item.productId);
          if (!product) {
            continue; // Skip this item and proceed to the next
          }
          const variant = product.variants.find((v) => v.sku === item.sku);
          if (!variant) {
            continue;
          }
      
          wishlist.items.push(item);
        }
      
        await wishlist.save();
      }
}

export const wishlistService = new WishlistService();
