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
exports.liveSearch = void 0;
const mongoose_1 = require("mongoose");
const models_1 = require("../models");
const http_errors_1 = __importDefault(require("http-errors"));
const liveSearch = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query.query;
    const parentCategoryId = req.query.parentCategoryId;
    const limit = parseInt(req.query.limit) || 10;
    if (!query || query.length < 2) {
        return next((0, http_errors_1.default)(400, "Query must be at least 2 characters long"));
    }
    const searchStage = {
        $search: {
            index: "default", // Make sure you've created this index
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
                value: new mongoose_1.Types.ObjectId(parentCategoryId),
            },
        });
    }
    const products = yield models_1.Product.aggregate([
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
    res.status(200).json({ products });
});
exports.liveSearch = liveSearch;
//# sourceMappingURL=liveSearchController.js.map