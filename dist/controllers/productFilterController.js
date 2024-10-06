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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productFilters = void 0;
const models_1 = require("../models");
const http_errors_1 = __importDefault(require("http-errors"));
const mongoose_1 = require("mongoose");
// import redisClient from "../db/connectRedis";
const productFilters = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { parentCategoryId, categoryId } = req.query;
    if (!parentCategoryId) {
        return next((0, http_errors_1.default)(400, "parentCategoryId is required"));
    }
    const matchStage = {
        $match: Object.assign({ parentCategoryId: new mongoose_1.Types.ObjectId(parentCategoryId) }, (categoryId
            ? { categoryId: new mongoose_1.Types.ObjectId(categoryId) }
            : {})),
    };
    const result = yield models_1.Product.aggregate([
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
    res.status(200).json({ filters: result[0] });
});
exports.productFilters = productFilters;
//# sourceMappingURL=productFilterController.js.map