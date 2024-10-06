import { Document } from "mongoose";
import { ProfileDoc } from "./profileModel";
import { PLATFORMS, ROLE } from "../utils/constants";
export interface UserDoc extends Document {
    platform: (typeof PLATFORMS)[keyof typeof PLATFORMS];
    role: (typeof ROLE)[keyof typeof ROLE];
    email: string;
    password: string;
    confirmPassword?: string;
    profile?: ProfileDoc;
    isVerified: boolean;
    verified?: Date;
    passwordToken?: string;
    passwordTokenExpirationDate?: Date;
    verificationToken?: string;
    verificationTokenExpirationDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    comparePassword(password: string): Promise<boolean>;
}
declare const UserModel: import("mongoose").Model<UserDoc, {}, {}, {}, Document<unknown, {}, UserDoc> & UserDoc & Required<{
    _id: unknown;
}> & {
    __v?: number;
}, any>;
export default UserModel;
