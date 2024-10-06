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
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignUniqueBookIds = void 0;
exports.migrateNames = migrateNames;
exports.migrateProfiles = migrateProfiles;
const models_1 = require("../models");
// Shuffle array to ensure uniqueness
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
// Randomly assign unique bookIds
const assignUniqueBookIds = () => __awaiter(void 0, void 0, void 0, function* () {
    const allProducts = yield models_1.Product.aggregate([
        {
            $lookup: {
                from: "reviews",
                localField: "_id",
                foreignField: "productId",
                as: "allReviews",
            },
        },
    ]);
    const allBuyer = yield models_1.Profile.find({ role: "buyer" }).lean();
    let shuffledIds = shuffleArray([...allBuyer]); // Clone and shuffle the newIds array
    let idIndex = 0; // Track the index of newIds
    allProducts.forEach((product) => {
        if (product.allReviews && product.allReviews.length > 0) {
            // Assign unique bookIds
            product.allReviews.forEach((rev) => __awaiter(void 0, void 0, void 0, function* () {
                // Reset index if we've used all newIds (to allow reuse)
                if (idIndex >= shuffledIds.length) {
                    shuffledIds = shuffleArray([...allBuyer]); // Reshuffle if necessary
                    idIndex = 0;
                }
                yield models_1.Review.findByIdAndUpdate(rev._id, {
                    userId: shuffledIds[idIndex++].userId,
                });
            }));
        }
    });
});
exports.assignUniqueBookIds = assignUniqueBookIds;
function migrateNames() {
    return __awaiter(this, void 0, void 0, function* () {
        // await Profile.updateMany({}, [
        //   {
        //     $set: {
        //       tempName: "$givenName",
        //     },
        //   },
        //   {
        //     $set: {
        //       givenName: "$familyName",
        //       familyName: "$tempName",
        //     },
        //   },
        //   {
        //     $unset: "tempName",
        //   },
        // ]);
        // await Profile.updateMany({}, [
        //   {
        //     $set: {
        //       fullName: { $concat: ["$givenName", " ", "$familyName"] },
        //     },
        //   },
        // ]);
    });
}
// import { Document, Schema, model, Types, Model } from "mongoose";
// // Define the interface for UserInteraction document
// export interface UserInteractionDoc extends Document {
//   userId: Types.ObjectId;
//   productId: Types.ObjectId;
//   views: number;
//   clicks: number;
//   purchases: number;
//   lastInteracted: Date;
//   interactionHistory: {
//     type: string;
//     timestamp: Date;
//   }[];
//   totalTimeSpent: number; // in seconds
//   tags: string[];
//   device: {
//     type: string;
//     model: string;
//     os: string;
//   };
//   location: {
//     country: string;
//     city: string;
//     coordinates: [number, number]; // [longitude, latitude]
//   };
//   calculateEngagementScore(): number;
//   addInteraction(type: string): Promise<void>;
// }
// // Define methods interface
// interface UserInteractionMethods {
//   calculateEngagementScore(): number;
//   addInteraction(type: string): Promise<void>;
// }
// // Define model interface
// interface UserInteractionModel extends Model<UserInteractionDoc, {}, UserInteractionMethods> {
//   findMostViewedProducts(limit: number): Promise<UserInteractionDoc[]>;
// }
// // Create the schema for UserInteraction
// const UserInteractionSchema = new Schema<UserInteractionDoc, UserInteractionModel, UserInteractionMethods>(
//   {
//     userId: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       index: true,
//     },
//     productId: {
//       type: Schema.Types.ObjectId,
//       ref: "Product",
//       required: true,
//       index: true,
//     },
//     views: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },
//     clicks: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },
//     purchases: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },
//     lastInteracted: {
//       type: Date,
//       default: Date.now,
//       index: true,
//     },
//     interactionHistory: [{
//       type: {
//         type: String,
//         enum: ['view', 'click', 'purchase'],
//         required: true,
//       },
//       timestamp: {
//         type: Date,
//         default: Date.now,
//       },
//     }],
//     totalTimeSpent: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },
//     tags: [{
//       type: String,
//       index: true,
//     }],
//     device: {
//       type: {
//         type: String,
//         enum: ['mobile', 'tablet', 'desktop'],
//         required: true,
//       },
//       model: String,
//       os: String,
//     },
//     location: {
//       country: String,
//       city: String,
//       coordinates: {
//         type: [Number],
//         index: '2dsphere',
//       },
//     },
//   },
//   {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   }
// );
// // Define a compound index for userId and productId
// UserInteractionSchema.index({ userId: 1, productId: 1 }, { unique: true });
// // Define methods
// UserInteractionSchema.methods.calculateEngagementScore = function(): number {
//   return (this.views * 1) + (this.clicks * 2) + (this.purchases * 5);
// };
// UserInteractionSchema.methods.addInteraction = async function(type: string): Promise<void> {
//   this.interactionHistory.push({ type, timestamp: new Date() });
//   switch (type) {
//     case 'view':
//       this.views += 1;
//       break;
//     case 'click':
//       this.clicks += 1;
//       break;
//     case 'purchase':
//       this.purchases += 1;
//       break;
//   }
//   this.lastInteracted = new Date();
//   await this.save();
// };
// // Define static methods
// UserInteractionSchema.statics.findMostViewedProducts = function(limit: number): Promise<UserInteractionDoc[]> {
//   return this.aggregate([
//     { $sort: { views: -1 } },
//     { $limit: limit },
//     { $lookup: { from: 'products', localField: 'productId', foreignField: '_id', as: 'product' } },
//     { $unwind: '$product' },
//   ]);
// };
// // Create and export the model
// export const UserInteraction = model<UserInteractionDoc, UserInteractionModel>('UserInteraction', UserInteractionSchema);
// import { Types } from "mongoose";
// import Product, { ProductDoc } from "./productModel";
// import { UserInteraction } from "./userInteractionModel";
// interface RecommendationCriteria {
//   userId: Types.ObjectId;
//   categoryId?: Types.ObjectId;
//   limit?: number;
//   excludeProductId?: Types.ObjectId;
// }
// ProductSchema.statics.getRecommendedProducts = async function(
//   criteria: RecommendationCriteria
// ): Promise<ProductDoc[]> {
//   const { userId, categoryId, limit = 10, excludeProductId } = criteria;
//   // Get user's interaction data
//   const userInteractions = await UserInteraction.find({ userId })
//     .sort({ lastInteracted: -1 })
//     .limit(50)  // Consider the last 50 interactions
//     .lean();
//   // Extract product IDs and create a map of product to interaction score
//   const interactedProductIds = userInteractions.map(interaction => interaction.productId);
//   const interactionScores = new Map(userInteractions.map(interaction => [
//     interaction.productId.toString(),
//     interaction.views * 1 + interaction.clicks * 2 + interaction.purchases * 5
//   ]));
//   const baseQuery: any = {
//     "variants.inventory": { $gt: 0 }, // Only recommend products in stock
//   };
//   if (categoryId) {
//     baseQuery.categoryId = categoryId;
//   }
//   if (excludeProductId) {
//     baseQuery._id = { $ne: excludeProductId };
//   }
//   const recommendedProducts = await this.aggregate([
//     { $match: baseQuery },
//     {
//       $addFields: {
//         interactionScore: {
//           $cond: [
//             { $in: ["$_id", interactedProductIds] },
//             { $function: {
//               body: function(id) {
//                 return interactionScores.get(id.toString()) || 0;
//               },
//               args: ["$_id"],
//               lang: "js"
//             }},
//             0
//           ]
//         }
//       }
//     },
//     {
//       $addFields: {
//         score: {
//           $add: [
//             { $multiply: ["$popularity", 0.3] },
//             { $multiply: ["$salesCount", 0.2] },
//             { $cond: [{ $eq: ["$isFeatured", true] }, 10, 0] },
//             { $multiply: ["$reviews.averageRating", 1.5] },
//             { $multiply: ["$interactionScore", 0.5] }
//           ]
//         }
//       }
//     },
//     { $sort: { score: -1 } },
//     { $limit: limit },
//     {
//       $lookup: {
//         from: "profiles",
//         localField: "sellerId",
//         foreignField: "userId",
//         as: "seller"
//       }
//     },
//     { $unwind: "$seller" },
//     {
//       $project: {
//         _id: 1,
//         name: 1,
//         description: 1,
//         brand: 1,
//         images: 1,
//         reviews: 1,
//         popularity: 1,
//         salesCount: 1,
//         isFeatured: 1,
//         variants: 1,
//         "seller.businessName": 1,
//         "seller.avatar": 1,
//         score: 1,
//         interactionScore: 1
//       }
//     }
//   ]);
//   return recommendedProducts;
// };
// // Update your Product model type to include the new static method
// interface ProductModel extends Model<ProductDoc> {
//   getRecommendedProducts(criteria: RecommendationCriteria): Promise<ProductDoc[]>;
// }
// // Update your Product model export
// const Product = model<ProductDoc, ProductModel>("Product", ProductSchema);
// export default Product;
function generateRandomPostalCode() {
    return Math.floor(1 + Math.random() * 30);
}
function migrateProfiles() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const products = yield models_1.Product.find({}).lean();
            for (const product of products) {
                const variants = product.variants.map(variant => {
                    return Object.assign(Object.assign({}, variant), { inventory: generateRandomPostalCode() });
                });
                yield models_1.Product.findOneAndUpdate({ _id: product._id }, { variants: variants });
            }
            console.log('Migration completed successfully');
        }
        catch (error) {
            console.error('Migration failed:', error);
        }
    });
}
//# sourceMappingURL=test.js.map