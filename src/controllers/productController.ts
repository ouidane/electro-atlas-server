import { Request, Response, NextFunction } from "express";
import { productService } from "../services/productService";

class ProductController {
  async getAllProducts(req: Request, res: Response) {
    const result = await productService.getAllProducts(req.query);
    res.status(200).json(result);
  }

  async getProductById(req: Request, res: Response) {
    const product = await productService.getProductById(req.params.productId);
    res.status(200).json({ product });
  }

  async createProduct(req: Request, res: Response) {
    const productData = {
      ...req.body,
      sellerId: req.user.id,
    };
    const product = await productService.createProduct(
      productData,
      req.files as Express.Multer.File[]
    );
    res.status(201).json({ message: "Product created", product });
  }

  async updateProduct(req: Request, res: Response) {
    const { productId } = req.params;
    const product = await productService.updateProduct(
      productId,
      req.body,
      req.files as Express.Multer.File[]
    );
    res.status(200).json({ message: "Product updated", product });
  }

  async deleteProduct(req: Request, res: Response) {
    await productService.deleteProduct(req.params.productId);
    res.status(200).json({ message: "Product deleted" });
  }
}

export const productController = new ProductController();
