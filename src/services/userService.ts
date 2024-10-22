import createError from "http-errors";
import { User, Profile, Cart, Wishlist } from "../models";
import { PLATFORMS, ROLE } from "../utils/constants";
import { buildFilterOption, buildSortOption } from "../utils/queryFilter";
import { IUserData, IUserQueryParams, IUserUpdateData } from "../types/types";

export class UserService {
  private static instance: UserService;

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  private usersFilterQuery(filters: { [key: string]: string }) {
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
    const filterKeys = buildFilterOption(filters, filterHandlers);

    return filterKeys;
  }

  private userSortQuery(sort: string) {
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

    return sortCriteria;
  }

  public async getUsers(queryParams: IUserQueryParams) {
    const { limitNumber, skip, sort, filters } = queryParams;

    const queryObject = this.usersFilterQuery(filters);
    const sortCriteria = this.userSortQuery(sort);

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

    return { users, totalCount };
  }

  public async createUser(userData: IUserData) {
    const { platform, role, email, password, confirmPassword } = userData;

    const user = await User.create({
      platform,
      role,
      email,
      password,
      confirmPassword,
      isVerified: true,
      verified: new Date(),
    });

    if (platform === PLATFORMS.MARKETPLACE) {
      await Promise.all([
        Cart.create({ userId: user._id }),
        Wishlist.create({ userId: user._id }),
      ]);
    }

    return user;
  }

  public async getUserById(userId: string) {
    const user = await User.findById(userId)
      .populate({
        path: "profile",
        select: "-__v -createdAt -updatedAt",
        options: { lean: true },
      })
      .select("_id email isVerified profile role createdAt updatedAt")
      .lean();

    if (!user) {
      throw createError(404, "User not found");
    }

    return user;
  }

  public async updateProfileByUserId(userId: string, userData: IUserUpdateData) {
    let profile = await Profile.findOne({ userId });
    if (!profile) {
      profile = new Profile({ userId });
    }

    Object.assign(profile, {
      familyName: userData.familyName,
      givenName: userData.givenName,
      phone: userData.phone,
      contact: {
        email: userData.contactEmail,
        phone: userData.contactPhone,
        website: userData.contactWebsite,
      },
      address: {
        line1: userData.line1,
        line2: userData.line2,
        postalCode: userData.postalCode,
        country: userData.country,
        city: userData.city,
      },
      description: userData.description,
    });

    await profile.save();
    return profile;
  }

  public async updateUserById(userId: string, userData: IUserUpdateData) {
    const user = await User.findById(userId);
    if (!user) {
      throw createError(404, "User not found");
    }

    if (userData.password) {
      user.password = userData.password;
    }
    if (userData.role) {
      user.role = userData.role as (typeof ROLE)[keyof typeof ROLE];
    }

    await user.save();
    return user;
  }

  public async deleteUserById(userId: string) {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw createError(404, "User not found");
    }
    return user;
  }

  public async getCurrentUserData(userId: string) {
    const [user, cart, wishlist] = await Promise.all([
      this.getUserById(userId),
      Cart.findOne({ userId }).lean(),
      Wishlist.findOne({ userId }).lean(),
    ]);

    return {
      user,
      cartId: cart?._id || undefined,
      wishlistId: wishlist?._id || undefined,
    };
  }
}

export const userService = UserService.getInstance();
