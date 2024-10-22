import { Document, Schema, Types, model } from "mongoose";
import validator from "validator";
import { CITIES, COUNTRIES } from "../utils/constants";

// Define the interface for Profile document
export interface ProfileDoc extends Document {
  userId: Types.ObjectId | string;
  familyName?: string;
  givenName?: string;
  fullName?: string;
  phone?: string;
  contact: {
    email?: string;
    phone?: string;
    website?: string;
  };
  address: {
    line1?: string;
    line2?: string;
    postalCode?: string;
    country?: (typeof COUNTRIES)[keyof typeof COUNTRIES];
    city?: (typeof CITIES)[keyof typeof CITIES];
  };
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Create the schema for Profile
const ProfileSchema = new Schema<ProfileDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
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
        validator: (value: string) => validator.isMobilePhone(value, "ar-MA"),
        message: "Invalid phone number",
      },
    },
    contact: {
      email: {
        type: String,
        trim: true,
        validate: {
          validator: (value: string) => validator.isEmail(value),
          message: "Invalid email",
        },
      },
      phone: {
        type: String,
        trim: true,
        validate: {
          validator: (value: string) => validator.isMobilePhone(value, "ar-MA"),
          message: "Invalid phone number",
        },
      },
      website: {
        type: String,
        trim: true,
        validate: {
          validator: (value: string) => validator.isURL(value),
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
        enum: Object.values(CITIES),
      },
      country: {
        type: String,
        enum: Object.values(COUNTRIES),
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
  },
  {
    timestamps: true,
  }
);

ProfileSchema.pre("save", async function (next) {
  if (this.isModified("givenName") || this.isModified("familyName")) {
    this.fullName = `${this.givenName} ${this.familyName}`;
  }
  next();
});

const Profile = model("Profile", ProfileSchema);

export default Profile;
