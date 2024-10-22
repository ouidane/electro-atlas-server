import { Request, Response, NextFunction } from "express";
import { cartService } from "../services/cartService";

class CartController {
  // Get carts
  async getCarts(req: Request, res: Response, next: NextFunction) {
    const result = await cartService.getCarts(req.query);
    res.status(200).json(result);
  }

  // Get Cart By Id
  async getCartById(req: Request, res: Response, next: NextFunction) {
    const { cartId } = req.params;
    const cart = await cartService.getCartById(cartId);
    res.status(200).json({ cart });
  }

  // Get Item By Id
  async getItemById(req: Request, res: Response, next: NextFunction) {
    const { cartId, itemId } = req.params;
    const item = await cartService.getItemById(cartId, itemId);
    res.status(200).json({ item });
  }

  // Add item to cart
  async addItemToCart(req: Request, res: Response, next: NextFunction) {
    const { cartId } = req.params;
    const { productId, sku, quantity = 1 } = req.body;
    await cartService.addItemToCart(cartId, productId, sku, quantity);
    res.status(201).json({ message: "Cart item added successfully" });
  }

  // Update item in cart
  async updateItemInCart(req: Request, res: Response, next: NextFunction) {
    const { cartId, itemId } = req.params;
    const quantity = Number(req.body.quantity);
    await cartService.updateItemInCart(cartId, itemId, quantity);
    res.status(200).json({ message: "Cart item updated successfully" });
  }

  // Delete item in cart
  async deleteItemFromCart(req: Request, res: Response, next: NextFunction) {
    const { cartId, itemId } = req.params;
    await cartService.deleteItemFromCart(cartId, itemId);
    res.status(200).json({ message: "Cart item deleted successfully" });
  }

  // Delete all items in cart
  async clearCart(req: Request, res: Response, next: NextFunction) {
    const { cartId } = req.params;
    await cartService.clearCartById(cartId);
    res.status(200).json({ message: "Cart is cleared successfully" });
  }
}

export const cartController = new CartController();
