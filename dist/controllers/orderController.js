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
exports.getOrderById = exports.getAllOrders = exports.getBuyerOrders = void 0;
const models_1 = require("../models");
const http_errors_1 = __importDefault(require("http-errors"));
const getBuyerOrders = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const { limit = 10, page = 1 } = req.query;
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;
    const orders = yield models_1.Order.find({ userId })
        .populate({ path: "orderItems", select: "-__v", options: { lean: true } })
        .select("-__v")
        .sort({ createdAt: "desc" })
        .skip(skip)
        .limit(limitNumber)
        .lean();
    const totalCount = yield models_1.Order.countDocuments({ userId });
    res.status(200).json({
        orders,
        pagination: {
            currentPage: pageNumber,
            totalPages: Math.ceil(totalCount / limitNumber),
            totalCount,
            limit: limitNumber,
        },
    });
});
exports.getBuyerOrders = getBuyerOrders;
const getAllOrders = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, limit = 10, page = 1 } = req.query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;
    // Build the query
    const query = {};
    if (userId) {
        query.userId = userId;
    }
    const orders = yield models_1.Order.find(query)
        .populate({ path: "orderItems", select: "-__v", options: { lean: true } })
        .select("-__v")
        .sort({ createdAt: "desc" })
        .skip(skip)
        .limit(limitNumber)
        .lean();
    const totalOrders = yield models_1.Order.countDocuments(query);
    res.status(200).json({
        orders,
        pagination: {
            currentPage: pageNumber,
            totalPages: Math.ceil(totalOrders / limitNumber),
            totalOrders,
            limit: limitNumber,
        },
    });
});
exports.getAllOrders = getAllOrders;
const getOrderById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId } = req.params;
    const order = yield models_1.Order.findById(orderId)
        .populate({ path: "orderItems", select: "-__v", options: { lean: true } })
        .select("-__v")
        .lean();
    if (!order) {
        return next((0, http_errors_1.default)(404, "Order not found"));
    }
    res.status(200).json({ order });
});
exports.getOrderById = getOrderById;
//# sourceMappingURL=orderController.js.map