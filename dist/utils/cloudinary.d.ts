import { UploadApiResponse } from "cloudinary";
import { type ImageUrls } from "../@types/types";
export declare const uploadToCloudinary: (dataURI: string, uploadPreset: string, imageName: string) => Promise<UploadApiResponse>;
export declare const generateImageUrls: (publicId: string) => ImageUrls;
export declare const destroyImage: (publicId: string) => Promise<void>;
