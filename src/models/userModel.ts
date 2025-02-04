import { Schema, Document, model } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import Profile, { ProfileDoc } from "./profileModel";
import Cart from "./cartModel";
import Wishlist from "./wishlistModel";
import { PLATFORMS, ROLE } from "../utils/constants";

// Define the interface for User document
export interface UserDoc extends Document {
  platform: (typeof PLATFORMS)[keyof typeof PLATFORMS];
  role: (typeof ROLE)[keyof typeof ROLE];
  email: string;
  password: string;
  confirmPassword?: string;
  profile: ProfileDoc;
  isVerified: boolean;
  verified?: Date;
  passwordToken?: string;
  passwordTokenExpirationDate?: Date;
  passwordTokenRequestHistory: Date[];
  verificationToken?: string;
  verificationTokenExpirationDate?: Date;
  verificationTokenRequestHistory: Date[];
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword(password: string): Promise<boolean>;
}

// Create the schema for User
const UserSchema = new Schema<UserDoc>(
  {
    platform: {
      type: String,
      enum: Object.values(PLATFORMS),
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLE),
      default: ROLE.BUYER,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string) => validator.isEmail(value),
        message: "Invalid email",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password is too short"],
    },
    confirmPassword: {
      type: String,
      validate: {
        validator: function (this) {
          return (
            !this.isModified("password") ||
            this.password === this.confirmPassword
          );
        },
        message: "Passwords do not match",
      },
    },
    isVerified: { type: Boolean, default: false },
    verified: { type: Date },
    passwordToken: { type: String },
    passwordTokenExpirationDate: { type: Date },
    passwordTokenRequestHistory: { type: [Date], default: [] },
    verificationToken: { type: String },
    verificationTokenExpirationDate: { type: Date },
    verificationTokenRequestHistory: { type: [Date], default: [] },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Modify the virtual field definition
UserSchema.virtual("profile", {
  ref: "Profile",
  localField: "_id",
  foreignField: "userId",
  justOne: true,
});

// Create the index for Profile
UserSchema.index({ platform: 1, email: 1 }, { unique: true });

// Pre-save hook to hash password
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      const hashedPassword = await bcrypt.hash(this.password, 12);
      this.password = hashedPassword;
      this.confirmPassword = undefined;
    } catch (err: any) {
      return next(err);
    }
  }
  next();
});

// Define custom method to compare passwords
UserSchema.methods.comparePassword = async function (password: string) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

// Define custom method to delete Profile, Cart and Wishlist
UserSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      await Promise.all([
        Profile.deleteOne({ userId: this._id }),
        Cart.deleteOne({ userId: this._id }),
        Wishlist.deleteOne({ userId: this._id }),
      ]);
      next();
    } catch (err: any) {
      next(err);
    }
  }
);

const UserModel = model<UserDoc>("User", UserSchema);

export default UserModel;
