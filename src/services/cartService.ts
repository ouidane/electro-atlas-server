import { Types } from "mongoose";
import createError from "http-errors";
import { CartItem, Cart, Product } from "../models";
import { buildSortOption } from "../utils/queryFilter";
import { FormattedItem } from "../types/types";

class CartService {
  async getCarts(queryParams: any) {
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
    } = queryParams;

    const skip = (page - 1) * limit;
    const query = this.buildCartQuery({
      minAmount,
      maxAmount,
      minTotalProducts,
      maxTotalProducts,
      minTotalItems,
      maxTotalItems,
    });

    const sortOptions = this.buildCartSort(sort);

    const [carts, totalCount] = await Promise.all([
      Cart.find(query)
        .select("-__v")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Cart.countDocuments(query),
    ]);

    if (!carts || carts.length === 0) {
      throw createError(404, "No carts found");
    }

    return {
      carts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
      },
    };
  }

  /**
   * Get cart by ID with all items
   */
  async getCartById(cartId: string) {
    const cart = await Cart.findById(cartId).select("-__v").lean();
    if (!cart) {
      throw createError(404, "Cart not found");
    }

    const cartItems = await this.getCartItems(cartId);
    if (!cartItems || cartItems.length === 0) {
      throw createError(404, "Cart is empty");
    }

    return { ...cart, cartItems };
  }

  /**
   * Get cart by ID with all items
   */
  async getCartByUserId(userId: string) {
    const cart = await Cart.findOne({ userId }).select("-__v").lean();
    if (!cart) {
      throw createError(404, "Cart not found");
    }

    const cartItems = await this.getCartItems(cart._id.toString());
    if (!cartItems || cartItems.length === 0) {
      throw createError(404, "Cart is empty");
    }

    return { ...cart, cartItems };
  }

  /**
   * Get formatted cart items
   */
  async getCartItems(cartId: string): Promise<FormattedItem[]> {
    const objectId = new Types.ObjectId(cartId);

    const cartItems: FormattedItem[] = await CartItem.aggregate([
      { $match: { cartId: objectId } },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $addFields: {
          matchedVariant: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$product.variants",
                  as: "variant",
                  cond: { $eq: ["$$variant.sku", "$sku"] },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $project: this.getCartItemProjection(),
      },
    ]);

    return cartItems;
  }

  /**
   * get item
   */
  async getItemById(cartId: string, itemId: string) {
    const item = await CartItem.findOne({ cartId, _id: itemId });
    if (!item) {
      throw createError(404, "Item not found in cart");
    }
    return item;
  }

  /**
   * Add item to cart
   */
  async addItemToCart(
    cartId: string,
    productId: string,
    sku: string,
    quantity: number = 1
  ) {
    const product = await Product.findById(productId).lean();
    if (!product) {
      throw createError(404, "Product not found");
    }

    const variant = product.variants.find((v) => v.sku === sku);
    if (!variant) {
      throw createError(404, "Product variant not found");
    }

    await this.upsertCartItem(cartId, productId, sku, quantity);
    await this.updateCartTotals(cartId);
  }

  /**
   * Update item quantity in cart
   */
  async updateItemInCart(cartId: string, itemId: string, quantity: number) {
    const item = await CartItem.findOne({ cartId, _id: itemId });
    if (!item) {
      throw createError(404, "Item not found in cart");
    }

    if (quantity === 0) {
      await CartItem.findByIdAndDelete(itemId);
    } else {
      item.quantity = quantity;
      await item.save();
    }

    await this.updateCartTotals(cartId);
  }

  /**
   * Remove item from cart
   */
  async deleteItemFromCart(cartId: string, itemId: string) {
    const item = await CartItem.findOneAndDelete({ cartId, _id: itemId });
    if (!item) {
      throw createError(404, "Item not found in cart");
    }

    await this.updateCartTotals(cartId);
  }

  /**
   * Clear all items from cart
   */
  async clearCartById(cartId: string) {
    await Promise.all([
      CartItem.deleteMany({ cartId }),
      Cart.findByIdAndUpdate(cartId, {
        amount: 0,
        totalItems: 0,
        totalProducts: 0,
      }),
    ]);
  }

  // Private helper methods
  private buildCartQuery(filters: Record<string, number>) {
    const query: Record<string, any> = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        const field = key.replace(/^(min|max)/, "").toLowerCase();
        const operator = key.startsWith("min") ? "$gte" : "$lte";

        query[field] = query[field] || {};
        query[field][operator] = value;
      }
    });

    return query;
  }

  private buildCartSort(sort: string) {
    const AllowedSortFields = {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      amount: "amount",
      totalProducts: "totalProducts",
      totalItems: "totalItems",
    };

    return buildSortOption(sort, AllowedSortFields);
  }

  private getCartItemProjection() {
    return {
      _id: 0,
      itemId: "$_id",
      quantity: 1,
      productId: 1,
      productName: "$product.name",
      totalPrice: {
        $round: [
          {
            $multiply: [
              "$quantity",
              {
                $ifNull: [
                  "$matchedVariant.salePrice",
                  "$matchedVariant.globalPrice",
                ],
              },
            ],
          },
          2,
        ],
      },
      image: { $arrayElemAt: ["$product.images.tiny", 0] },
      sellerId: "$product.sellerId",
      variant: "$matchedVariant",
      createdAt: 1,
      updatedAt: 1,
    };
  }

  private async upsertCartItem(
    cartId: string,
    productId: string,
    sku: string,
    quantity: number
  ) {
    const item = await CartItem.findOne({ cartId, productId, sku });

    if (item) {
      item.quantity += quantity;
      await item.save();
    } else {
      await CartItem.create({ quantity, cartId, productId, sku });
    }
  }

  private async updateCartTotals(cartId: unknown) {
    const cartItems = await CartItem.find({ cartId })
      .populate("productId")
      .lean();

    const totalItems = cartItems.length;
    const totalProducts = cartItems.reduce(
      (acc, item) => acc + item.quantity,
      0
    );
    const totalPrice = cartItems.reduce((acc, item) => {
      const product = item.productId as any;
      const variant = product.variants.find((v: any) => v.sku === item.sku);
      return acc + item.quantity * (variant.salePrice || variant.globalPrice);
    }, 0);

    await Cart.findByIdAndUpdate(cartId, {
      amount: parseFloat(totalPrice.toFixed(2)),
      totalItems,
      totalProducts,
    });
  }

  async addCartToDatabase(cartItems: any[], userId: unknown) {
    const cart = await Cart.create({ userId });
    if (!cartItems || cartItems.length === 0) return;

    for (const item of cartItems) {
      const product = await Product.findById(item.productId);
      if (!product || item.quantity <= 0) {
        continue; // Skip this item and proceed to the next
      }

      await CartItem.create({
        quantity: item.quantity,
        productId: item.productId,
        cartId: cart._id,
      });
    }

    await this.updateCartTotals(cart._id);
  }
}

export const cartService = new CartService();
