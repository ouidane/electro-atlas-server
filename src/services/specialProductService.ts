import { Types } from "mongoose";
import { OrderItem, ParentCategory, Product } from "../models";

class SpecialProductService {
  async getCategoriesWithBestOffers() {
    const parentCategories = await ParentCategory.find().sort("name").lean();

    return Promise.all(
      parentCategories.map(async (parentCategory) => {
        const products = await Product.aggregate([
          { $unwind: "$variants" },
          {
            $match: {
              parentCategoryId: parentCategory._id,
              "variants.discountPercent": { $gt: 0 },
            },
          },
          {
            $project: {
              name: 1,
              color: 1,
              isFeatured: 1,
              variant: "$variants",
              reviews: 1,
              image: { $arrayElemAt: ["$images.medium", 0] },
              createdAt: 1,
              updatedAt: 1,
            },
          },
          { $sort: { discountPercent: -1 } },
          { $limit: 10 },
        ]);

        return {
          parentCategory: {
            _id: parentCategory._id,
            name: parentCategory.name,
          },
          products,
        };
      })
    );
  }

  async getCategoriesWithBestSellers() {
    const parentCategories = await ParentCategory.find().lean();

    return Promise.all(
      parentCategories.map(async (parentCategory) => {
        const products = await OrderItem.aggregate([
          { $group: { _id: "$productId", numOfOrders: { $sum: 1 } } },
          {
            $lookup: {
              from: "products",
              localField: "_id",
              foreignField: "_id",
              as: "product",
            },
          },
          { $unwind: "$product" },
          { $match: { "product.parentCategoryId": parentCategory._id } },
          { $unwind: "$product.variants" },
          { $sort: { numOfOrders: -1 } },
          { $limit: 10 },
          {
            $project: {
              name: "$product.name",
              color: "$product.color",
              isFeatured: "$product.isFeatured",
              variant: "$product.variants",
              reviews: "$product.reviews",
              image: { $arrayElemAt: ["$product.images.medium", 0] },
              createdAt: "$product.createdAt",
              updatedAt: "$product.updatedAt",
            },
          },
        ]);

        return {
          parentCategory: {
            _id: parentCategory._id,
            name: parentCategory.name,
          },
          products,
        };
      })
    );
  }

  async searchProducts(
    query: string,
    parentCategoryId?: string,
    limit: number = 10
  ) {
    const searchStage: any = {
      $search: {
        index: "default",
        compound: {
          must: [
            {
              text: {
                query: query,
                path: "name",
                fuzzy: {
                  maxEdits: 1,
                  prefixLength: 2,
                },
              },
            },
          ],
          should: [
            {
              text: {
                query: query,
                path: "description",
                score: { boost: { value: 1.5 } },
              },
            },
          ],
        },
        highlight: {
          path: ["name", "description"],
        },
      },
    };

    if (parentCategoryId) {
      searchStage.$search.compound.must.push({
        equals: {
          path: "parentCategoryId",
          value: new Types.ObjectId(parentCategoryId),
        },
      });
    }

    return Product.aggregate([
      searchStage,
      { $limit: limit },
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          score: { $meta: "searchScore" },
          highlights: { $meta: "searchHighlights" },
        },
      },
    ]);
  }

  async getProductFilters(parentCategoryId: string, categoryId?: string) {
    const matchStage = {
      $match: {
        parentCategoryId: new Types.ObjectId(parentCategoryId as string),
        ...(categoryId
          ? { categoryId: new Types.ObjectId(categoryId as string) }
          : {}),
      },
    };

    const result = await Product.aggregate([
      matchStage,
      { $unwind: "$variants" },
      {
        $facet: {
          priceRange: [
            {
              $group: {
                _id: null,
                highestPrice: { $max: "$variants.globalPrice" },
                lowestPrice: { $min: "$variants.globalPrice" },
              },
            },
            { $project: { _id: 0, highestPrice: 1, lowestPrice: 1 } },
          ],
          specifications: [
            {
              $project: {
                _id: 0,
                color: 1,
                brand: 1,
                ramSize: "$specifications.ramSize",
                graphics: "$specifications.graphics",
                processor: "$specifications.processor",
                cpuSpeed: "$specifications.cpuSpeed",
                cpuManufacturer: "$specifications.cpuManufacturer",
                graphicsManufacturer: "$specifications.graphicsManufacturer",
                screenSize: "$specifications.screenSize",
                resolution: "$specifications.resolution",
                storage: "$specifications.storage",
                memory: "$specifications.memory",
                cameraResolution: "$specifications.cameraResolution",
                operatingSystem: "$specifications.operatingSystem",
              },
            },
            { $project: { specificationsArray: { $objectToArray: "$$ROOT" } } },
            { $unwind: "$specificationsArray" },
            {
              $group: {
                _id: "$specificationsArray.k",
                values: { $addToSet: "$specificationsArray.v" },
              },
            },
            {
              $project: {
                key: "$_id",
                filters: { $sortArray: { input: "$values", sortBy: -1 } },
                _id: 0,
              },
            },
            { $sort: { key: 1 } },
          ],
        },
      },
    ]);

    return result[0];
  }

  async getRecommendedProducts(
    categoryId: string,
    excludeProductId: string,
    limit: number = 10
  ) {
    const baseQuery: any = {
      "variants.inventory": { $gt: 0 },
    };

    if (categoryId) {
      baseQuery.categoryId = categoryId;
    }

    if (excludeProductId) {
      baseQuery._id = { $ne: excludeProductId };
    }

    const recommendedProducts = await Product.aggregate([
      { $unwind: "$variants" },
      { $match: baseQuery },
      {
        $addFields: {
          score: {
            $add: [
              { $multiply: ["$popularity", 0.3] },
              { $multiply: ["$salesCount", 0.2] },
              { $cond: [{ $eq: ["$isFeatured", true] }, 10, 0] },
              { $multiply: ["$reviews.averageRating", 1.5] },
            ],
          },
        },
      },
      { $sort: { score: -1 } },
      { $limit: limit },
      {
        $project: {
          name: 1,
          color: 1,
          isFeatured: 1,
          variant: "$variants",
          reviews: 1,
          image: { $arrayElemAt: ["$images.medium", 0] },
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    return recommendedProducts;
  }
}

export default new SpecialProductService();
