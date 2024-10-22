import { Request, Response, NextFunction } from "express";
import { wishlistService } from "../services/wishlistService";

class WishlistController {
  async getWishlists(req: Request, res: Response) {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await wishlistService.getWishlists(userId, page, limit);
    res.status(200).json(result);
  }

  async getWishlistById(req: Request, res: Response) {
    const { wishlistId } = req.params;
    const result = await wishlistService.getWishlistById(wishlistId);
    res.status(200).json({ wishlist: result });
  }

  async addItemToWishlist(req: Request, res: Response) {
    const { wishlistId } = req.params;
    const { productId, sku } = req.body;
    await wishlistService.addItemToWishlist(wishlistId, productId, sku);
    res.status(201).json({ message: "Item added to wishlist successfully" });
  }

  async deleteItemFromWishlist(req: Request, res: Response) {
    const { wishlistId } = req.params;
    const { productId, sku } = req.body;
    await wishlistService.deleteItemFromWishlist(wishlistId, productId, sku);
    res
      .status(200)
      .json({ message: "Item deleted from wishlist successfully" });
  }
}

export const wishlistController = new WishlistController();
