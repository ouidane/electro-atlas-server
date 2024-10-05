import dotenv from "dotenv";
import { UploadApiResponse, v2 as cloudinary } from "cloudinary";
import { IMAGE_SIZES } from "./constants";
import { type ImageUrls } from "../@types/types";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export const uploadToCloudinary = async (
  dataURI: string,
  uploadPreset: string,
  imageName: string
): Promise<UploadApiResponse> => {
  try {
    const result: UploadApiResponse = await cloudinary.uploader.upload(
      dataURI,
      {
        upload_preset: uploadPreset,
        public_id: imageName,
      }
    );
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error uploading to Cloudinary: ${error.message}`);
    } else {
      throw new Error(`Unknown error uploading to Cloudinary`);
    }
  }
};

export const generateImageUrls = (publicId: string): ImageUrls => {
  const transformImage = (width: number, height: number): string =>
    cloudinary.url(publicId, { width, height, crop: "fit", secure: true });

  const imageUrls: ImageUrls = {
    publicId: publicId,
    tiny: transformImage(IMAGE_SIZES.TINY, IMAGE_SIZES.TINY),
    medium: transformImage(IMAGE_SIZES.MEDIUM, IMAGE_SIZES.MEDIUM),
    large: transformImage(IMAGE_SIZES.LARGE, IMAGE_SIZES.LARGE),
  };
  return imageUrls;
};

export const destroyImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Image deletion failed: ${error.message}`);
    } else {
      throw new Error("An unknown error occurred during image deletion");
    }
  }
};
