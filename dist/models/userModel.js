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
const mongoose_1 = require("mongoose");
const validator_1 = __importDefault(require("validator"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const profileModel_1 = __importDefault(require("./profileModel"));
const cartModel_1 = __importDefault(require("./cartModel"));
const wishlistModel_1 = __importDefault(require("./wishlistModel"));
const constants_1 = require("../utils/constants");
// Create the schema for User
const UserSchema = new mongoose_1.Schema({
    platform: {
        type: String,
        enum: Object.values(constants_1.PLATFORMS),
        required: true,
    },
    role: {
        type: String,
        enum: Object.values(constants_1.ROLE),
        default: constants_1.ROLE.BUYER,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true,
        validate: {
            validator: (value) => validator_1.default.isEmail(value),
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
            validator: function () {
                return (!this.isModified("password") ||
                    this.password === this.confirmPassword);
            },
            message: "Passwords do not match",
        },
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verified: {
        type: Date,
    },
    passwordToken: {
        type: String,
    },
    passwordTokenExpirationDate: {
        type: Date,
    },
    verificationToken: {
        type: String,
    },
    verificationTokenExpirationDate: {
        type: Date,
        default: new Date(Date.now() + 1000 * 60 * 10),
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
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
UserSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isModified("password")) {
            try {
                const hashedPassword = yield bcryptjs_1.default.hash(this.password, 12);
                this.password = hashedPassword;
                this.confirmPassword = undefined;
            }
            catch (error) {
                return next(error);
            }
        }
        next();
    });
});
// Define custom method to compare passwords
UserSchema.methods.comparePassword = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield bcryptjs_1.default.compare(password, this.password);
        }
        catch (error) {
            throw new Error("Password comparison failed");
        }
    });
};
// Replace the pre-remove hook with pre-deleteOne
UserSchema.pre("deleteOne", { document: true, query: false }, function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield profileModel_1.default.deleteOne({ userId: this._id });
            yield cartModel_1.default.deleteOne({ userId: this._id });
            yield wishlistModel_1.default.deleteOne({ userId: this._id });
            next();
        }
        catch (error) {
            next(error);
        }
    });
});
const UserModel = (0, mongoose_1.model)("User", UserSchema);
exports.default = UserModel;
//# sourceMappingURL=userModel.js.map