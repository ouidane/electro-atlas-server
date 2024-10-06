import { Document, Schema, Types } from "mongoose";
import { CITIES, COUNTRIES } from "../utils/constants";
export interface ProfileDoc extends Document {
    userId: Types.ObjectId;
    familyName: string;
    givenName: string;
    fullName: string;
    phone?: string;
    contact?: {
        email?: string;
        phone?: string;
        website?: string;
    };
    address?: {
        line1: string;
        line2?: string;
        postalCode: string;
        country: (typeof COUNTRIES)[keyof typeof COUNTRIES];
        city: (typeof CITIES)[keyof typeof CITIES];
    };
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
declare const Profile: import("mongoose").Model<ProfileDoc, {}, {}, {}, Document<unknown, {}, ProfileDoc> & ProfileDoc & Required<{
    _id: unknown;
}> & {
    __v?: number;
}, Schema<ProfileDoc, import("mongoose").Model<ProfileDoc, any, any, any, Document<unknown, any, ProfileDoc> & ProfileDoc & Required<{
    _id: unknown;
}> & {
    __v?: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ProfileDoc, Document<unknown, {}, import("mongoose").FlatRecord<ProfileDoc>> & import("mongoose").FlatRecord<ProfileDoc> & Required<{
    _id: unknown;
}> & {
    __v?: number;
}>>;
export default Profile;
