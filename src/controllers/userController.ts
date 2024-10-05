import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { User, Profile, Cart, Wishlist } from "../models";
import { PLATFORMS } from "../utils/constants";
import { buildSortOption } from "../utils/sortHandler";

// Get Current User ======================
const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id;

  const user = await User.findById(userId)
    .populate({
      path: "profile",
      select: "-__v -createdAt -updatedAt",
      options: { lean: true },
    })
    .select("_id email isVerified profile role createdAt updatedAt")
    .lean();
  if (!user) {
    return next(createError(404, "User not found"));
  }

  const cart = await Cart.findOne({ userId }).lean();
  const wishlist = await Wishlist.findOne({ userId }).lean();

  res.status(200).json({
    user,
    cartId: cart._id || null,
    wishlistId: wishlist._id || null,
  });
};

// Update Current User ======================
const updateCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id;
  const {
    familyName,
    givenName,
    phone,
    contactEmail,
    contactPhone,
    contactWebsite,
    line1,
    line2,
    postalCode,
    city,
    country,
    description,
  } = req.body;

  let profile = await Profile.findOne({ userId });
  if (!profile) {
    profile = new Profile({});
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
  await profile.save();

  res.status(200).json({ message: "User updated successfully" });
};

// Get Users ======================
const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  const { limit, page, sort = "createdAt", ...filters } = req.query;
  const pageNumber = parseInt(page as string) || 1;
  const limitNumber = parseInt(limit as string) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  const queryObject: any = {};

  const filterHandlers = {
    platform: (value: string) => ({ platform: { $in: value.split(",") } }),
    isVerified: (value: string) => ({ isVerified: value === "true" }),
    role: (value: string) => ({ role: { $in: value.split(",") } }),
    city: (value: string) => ({ "profile.city": { $in: value.split(",") } }),
    country: (value: string) => ({
      "profile.country": { $in: value.split(",") },
    }),
    query: (value: string) => ({
      $or: [
        { "profile.fullName": { $regex: new RegExp(value, "i") } },
        { "profile.phone": { $regex: new RegExp(value, "i") } },
        { email: { $regex: new RegExp(value, "i") } },
      ],
    }),
    createdAfter: (value: string) => ({ createdAt: { $gte: new Date(value) } }),
    createdBefore: (value: string) => ({
      createdAt: { $lte: new Date(value) },
    }),
    updatedAfter: (value: string) => ({ updatedAt: { $gte: new Date(value) } }),
    updatedBefore: (value: string) => ({
      updatedAt: { $lte: new Date(value) },
    }),
    hasProfile: (value: string) =>
      value === "true"
        ? { profile: { $exists: true } }
        : { profile: { $exists: false } },
    inActive: (value: string) => ({
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
  const sortCriteria = buildSortOption(sort, AllowedSortFields);

  const result = await User.aggregate([
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

  const totalCount = result[0]?.totalCount[0]?.value || 0;
  const users = result[0]?.users;

  res.status(200).json({
    users,
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / limitNumber),
      totalCount,
      limit: limitNumber,
    },
  });
};

// Create User ======================
const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { platform, email, password, confirmPassword } = req.body;

  const user = await User.create({
    platform,
    email,
    password,
    confirmPassword,
    isVerified: true,
    verified: new Date(),
  });

  if (platform === PLATFORMS.MARKETPLACE) {
    await Cart.create({ userId: user._id });
    await Wishlist.create({ userId: user._id });
  }

  res.status(201).json({ message: "User created successfully" });
};

// Get User By Id ======================
const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.userId;

  const user = await User.findById(userId)
    .populate({
      path: "profile",
      select: "-__v -createdAt -updatedAt",
      options: { lean: true },
    })
    .select("_id email isVerified profile role createdAt updatedAt")
    .lean();
  if (!user) {
    return next(createError(404, "User not found"));
  }

  res.status(200).json({ user });
};

// Update User By Id ======================
const updateUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;
  const {
    email,
    password,
    familyName,
    givenName,
    phone,
    contactEmail,
    contactPhone,
    contactWebsite,
    line1,
    line2,
    postalCode,
    city,
    country,
    role,
    description,
  } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return next(createError(404, "User not found"));
  }

  user.isVerified = true;
  user.verified = new Date();
  user.email = email;
  user.password = password;
  user.role = role ? role : user.role;
  await user.save();

  let profile = await Profile.findOne({ userId });
  if (!profile) {
    profile = new Profile();
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
  await profile.save();

  res.status(200).json({ message: "User updated successfully" });
};

// Delete User By Id ======================
const deleteUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;

  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    return next(createError(404, "User not found"));
  }

  res.status(200).json({ message: "User updated successfully" });
};

export {
  getCurrentUser,
  updateCurrentUser,
  getUsers,
  createUser,
  getUserById,
  updateUserById,
  deleteUserById,
};
