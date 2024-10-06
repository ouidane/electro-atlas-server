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
const constants_1 = require("../utils/constants");
// Create the schema for Profile
const ProfileSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    familyName: {
        type: String,
        trim: true,
    },
    givenName: {
        type: String,
        trim: true,
    },
    fullName: {
        type: String,
    },
    phone: {
        type: String,
        trim: true,
        validate: {
            validator: (value) => validator_1.default.isMobilePhone(value, "ar-MA"),
            message: "Invalid phone number",
        },
    },
    contact: {
        email: {
            type: String,
            trim: true,
            validate: {
                validator: (value) => validator_1.default.isEmail(value),
                message: "Invalid email",
            },
        },
        phone: {
            type: String,
            trim: true,
            validate: {
                validator: (value) => validator_1.default.isMobilePhone(value, "ar-MA"),
                message: "Invalid phone number",
            },
        },
        website: {
            type: String,
            trim: true,
            validate: {
                validator: (value) => validator_1.default.isURL(value),
                message: "Invalid website URL",
            },
        },
    },
    address: {
        line1: {
            type: String,
            trim: true,
            maxlength: [100, "Address length is too long"],
        },
        line2: {
            type: String,
            trim: true,
            maxlength: [100, "Address length is too long"],
        },
        city: {
            type: String,
            enum: Object.values(constants_1.CITIES),
        },
        country: {
            type: String,
            enum: Object.values(constants_1.COUNTRIES),
        },
        postalCode: {
            type: String,
            trim: true,
            maxlength: [20, "Postal code length is too long"],
        },
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, "Description length is too long"],
    },
}, {
    timestamps: true,
});
ProfileSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isModified("givenName") || this.isModified("familyName")) {
            this.fullName = `${this.givenName} ${this.familyName}`;
        }
        next();
    });
});
const Profile = (0, mongoose_1.model)("Profile", ProfileSchema);
exports.default = Profile;
//# sourceMappingURL=profileModel.js.map