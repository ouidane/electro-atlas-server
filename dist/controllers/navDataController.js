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
exports.getNavData = void 0;
const models_1 = require("../models");
const connectRedis_1 = __importDefault(require("../db/connectRedis"));
const getNavData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const cachedData = yield connectRedis_1.default.get("departments");
    if (cachedData) {
        return res.status(200).json({ allDepartments: JSON.parse(cachedData) });
    }
    const allDepartments = yield models_1.ParentCategory.aggregate([
        {
            $lookup: {
                from: "categories",
                localField: "_id",
                foreignField: "parentCategoryId",
                as: "childCategories",
                pipeline: [{ $sort: { createdAt: 1 } }, { $project: { name: 1 } }],
            },
        },
        { $sort: { createdAt: 1 } },
        { $project: { name: 1, childCategories: 1 } },
    ]);
    yield connectRedis_1.default.set("departments", JSON.stringify(allDepartments));
    res.status(200).json({ allDepartments });
});
exports.getNavData = getNavData;
//# sourceMappingURL=navDataController.js.map