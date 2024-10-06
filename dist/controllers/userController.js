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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserById = exports.updateUserById = exports.getUserById = exports.createUser = exports.getUsers = exports.updateCurrentUser = exports.getCurrentUser = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const models_1 = require("../models");
const constants_1 = require("../utils/constants");
const sortHandler_1 = require("../utils/sortHandler");
// Get Current User ======================
const getCurrentUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const user = yield models_1.User.findById(userId)
        .populate({
        path: "profile",
        select: "-__v -createdAt -updatedAt",
        options: { lean: true },
    })
        .select("_id email isVerified profile role createdAt updatedAt")
        .lean();
    if (!user) {
        return next((0, http_errors_1.default)(404, "User not found"));
    }
    const cart = yield models_1.Cart.findOne({ userId }).lean();
    const wishlist = yield models_1.Wishlist.findOne({ userId }).lean();
    res.status(200).json({
        user,
        cartId: cart._id || null,
        wishlistId: wishlist._id || null,
    });
});
exports.getCurrentUser = getCurrentUser;
// Update Current User ======================
const updateCurrentUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { familyName, givenName, phone, contactEmail, contactPhone, contactWebsite, line1, line2, postalCode, city, country, description, } = req.body;
    let profile = yield models_1.Profile.findOne({ userId });
    if (!profile) {
        profile = new models_1.Profile({});
    }
    profile.familyName = familyName;
    profile.givenName = givenName;
    profile.phone = phone;
    profile.contact.email = contactEmail;
    profile.contact.phone = contactPhone;
    profile.contact.website = contactWebsite;
    profile.address.line1 = line1;
    profile.address.line2 = line2;
    profile.address.postalCode = postalCode;
    profile.address.country = country;
    profile.address.city = city;
    profile.description = description;
    yield profile.save();
    res.status(200).json({ message: "User updated successfully" });
});
exports.updateCurrentUser = updateCurrentUser;
// Get Users ======================
const getUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const _d = req.query, { limit, page, sort = "createdAt" } = _d, filters = __rest(_d, ["limit", "page", "sort"]);
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;
    const queryObject = {};
    const filterHandlers = {
        platform: (value) => ({ platform: { $in: value.split(",") } }),
        isVerified: (value) => ({ isVerified: value === "true" }),
        role: (value) => ({ role: { $in: value.split(",") } }),
        city: (value) => ({ "profile.city": { $in: value.split(",") } }),
        country: (value) => ({
            "profile.country": { $in: value.split(",") },
        }),
        query: (value) => ({
            $or: [
                { "profile.fullName": { $regex: new RegExp(value, "i") } },
                { "profile.phone": { $regex: new RegExp(value, "i") } },
                { email: { $regex: new RegExp(value, "i") } },
            ],
        }),
        createdAfter: (value) => ({ createdAt: { $gte: new Date(value) } }),
        createdBefore: (value) => ({
            createdAt: { $lte: new Date(value) },
        }),
        updatedAfter: (value) => ({ updatedAt: { $gte: new Date(value) } }),
        updatedBefore: (value) => ({
            updatedAt: { $lte: new Date(value) },
        }),
        hasProfile: (value) => value === "true"
            ? { profile: { $exists: true } }
            : { profile: { $exists: false } },
        inActive: (value) => ({
            updatedAt: { $lte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 * 6) },
        }),
    };
    for (const [key, value] of Object.entries(filters)) {
        if (key in filterHandlers) {
            Object.assign(queryObject, filterHandlers[key](value));
        }
    }
    const AllowedSortFields = {
        createdAt: "createdAt",
        updatedAt: "updatedAt",
        email: "email",
        role: "role",
        isVerified: "isVerified",
        platform: "platform",
        city: "profile.city",
        country: "profile.country",
        familyName: "profile.familyName",
        givenName: "profile.givenName",
        fullName: "profile.fullName",
    };
    const sortCriteria = (0, sortHandler_1.buildSortOption)(sort, AllowedSortFields);
    const result = yield models_1.User.aggregate([
        {
            $lookup: {
                from: "profiles",
                localField: "_id",
                foreignField: "userId",
                as: "profile",
            },
        },
        { $unwind: "$profile" },
        { $match: queryObject },
        {
            $facet: {
                totalCount: [{ $count: "value" }],
                users: [
                    {
                        $project: {
                            _id: 1,
                            email: 1,
                            isVerified: 1,
                            role: 1,
                            platform: 1,
                            createdAt: 1,
                            updatedAt: 1,
                            profile: 1,
                        },
                    },
                    { $sort: sortCriteria },
                    { $skip: skip },
                    { $limit: limitNumber },
                ],
            },
        },
    ]);
    const totalCount = ((_b = (_a = result[0]) === null || _a === void 0 ? void 0 : _a.totalCount[0]) === null || _b === void 0 ? void 0 : _b.value) || 0;
    const users = (_c = result[0]) === null || _c === void 0 ? void 0 : _c.users;
    res.status(200).json({
        users,
        pagination: {
            currentPage: pageNumber,
            totalPages: Math.ceil(totalCount / limitNumber),
            totalCount,
            limit: limitNumber,
        },
    });
});
exports.getUsers = getUsers;
// Create User ======================
const createUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { platform, email, password, confirmPassword } = req.body;
    const user = yield models_1.User.create({
        platform,
        email,
        password,
        confirmPassword,
        isVerified: true,
        verified: new Date(),
    });
    if (platform === constants_1.PLATFORMS.MARKETPLACE) {
        yield models_1.Cart.create({ userId: user._id });
        yield models_1.Wishlist.create({ userId: user._id });
    }
    res.status(201).json({ message: "User created successfully" });
});
exports.createUser = createUser;
// Get User By Id ======================
const getUserById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const user = yield models_1.User.findById(userId)
        .populate({
        path: "profile",
        select: "-__v -createdAt -updatedAt",
        options: { lean: true },
    })
        .select("_id email isVerified profile role createdAt updatedAt")
        .lean();
    if (!user) {
        return next((0, http_errors_1.default)(404, "User not found"));
    }
    res.status(200).json({ user });
});
exports.getUserById = getUserById;
// Update User By Id ======================
const updateUserById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const { email, password, familyName, givenName, phone, contactEmail, contactPhone, contactWebsite, line1, line2, postalCode, city, country, role, description, } = req.body;
    const user = yield models_1.User.findById(userId);
    if (!user) {
        return next((0, http_errors_1.default)(404, "User not found"));
    }
    user.isVerified = true;
    user.verified = new Date();
    user.email = email;
    user.password = password;
    user.role = role ? role : user.role;
    yield user.save();
    let profile = yield models_1.Profile.findOne({ userId });
    if (!profile) {
        profile = new models_1.Profile();
    }
    profile.familyName = familyName;
    profile.givenName = givenName;
    profile.phone = phone;
    profile.phone = phone;
    profile.contact.email = contactEmail;
    profile.contact.phone = contactPhone;
    profile.contact.website = contactWebsite;
    profile.address.line1 = line1;
    profile.address.line2 = line2;
    profile.address.postalCode = postalCode;
    profile.address.country = country;
    profile.address.city = city;
    profile.description = description;
    yield profile.save();
    res.status(200).json({ message: "User updated successfully" });
});
exports.updateUserById = updateUserById;
// Delete User By Id ======================
const deleteUserById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const user = yield models_1.User.findByIdAndDelete(userId);
    if (!user) {
        return next((0, http_errors_1.default)(404, "User not found"));
    }
    res.status(200).json({ message: "User updated successfully" });
});
exports.deleteUserById = deleteUserById;
//# sourceMappingURL=userController.js.map