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
exports.destroyImage = exports.generateImageUrls = exports.uploadToCloudinary = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const cloudinary_1 = require("cloudinary");
const constants_1 = require("./constants");
dotenv_1.default.config();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});
const uploadToCloudinary = (dataURI, uploadPreset, imageName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield cloudinary_1.v2.uploader.upload(dataURI, {
            upload_preset: uploadPreset,
            public_id: imageName,
        });
        return result;
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Error uploading to Cloudinary: ${error.message}`);
        }
        else {
            throw new Error(`Unknown error uploading to Cloudinary`);
        }
    }
});
exports.uploadToCloudinary = uploadToCloudinary;
const generateImageUrls = (publicId) => {
    const transformImage = (width, height) => cloudinary_1.v2.url(publicId, { width, height, crop: "fit", secure: true });
    const imageUrls = {
        publicId: publicId,
        tiny: transformImage(constants_1.IMAGE_SIZES.TINY, constants_1.IMAGE_SIZES.TINY),
        medium: transformImage(constants_1.IMAGE_SIZES.MEDIUM, constants_1.IMAGE_SIZES.MEDIUM),
        large: transformImage(constants_1.IMAGE_SIZES.LARGE, constants_1.IMAGE_SIZES.LARGE),
    };
    return imageUrls;
};
exports.generateImageUrls = generateImageUrls;
const destroyImage = (publicId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield cloudinary_1.v2.uploader.destroy(publicId);
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Image deletion failed: ${error.message}`);
        }
        else {
            throw new Error("An unknown error occurred during image deletion");
        }
    }
});
exports.destroyImage = destroyImage;
//# sourceMappingURL=cloudinary.js.map