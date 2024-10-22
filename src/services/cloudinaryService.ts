import { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import { Buffer } from "buffer";
import cloudinary from "../lib/cloudinary";
import { CloudinaryError } from "../errors";

// Types
interface ImageUrls {
  publicId: string;
  tiny: string;
  medium: string;
  large: string;
  original?: string;
}

interface UploadOptions {
  folder?: string;
  transformation?: any;
  quality?: string;
  format?: string;
  resourceType?: string;
}

export interface ImageBuffer {
  buffer: Buffer;
  mimetype: string;
}

// Constants
export const IMAGE_SIZES = {
  TINY: 200,
  MEDIUM: 400,
  LARGE: 800,
} as const;

/**
 * Image upload service class for handling multiple operations
 */
export class CloudinaryService {
  constructor(
    private readonly defaultOptions: UploadOptions = {},
    private readonly defaultImageOptions: Record<string, any> = {}
  ) {}

  async uploadImage(
    image: ImageBuffer,
    uploadPreset: string,
    imageName: string,
    options: UploadOptions = {}
  ): Promise<ImageUrls> {
    const dataURI = this.bufferToDataURI(image);
    const uploadOptions = { ...this.defaultOptions, ...options };

    const result = await this.uploadToCloudinary(
      dataURI,
      uploadPreset,
      imageName,
      uploadOptions
    );

    return this.generateImageUrls(result.public_id, {
      ...this.defaultImageOptions,
      format: options.format,
      quality: options.quality,
    });
  }

  async uploadMultipleImages(
    images: ImageBuffer[],
    uploadPreset: string,
    baseImageName: string,
    options: UploadOptions = {}
  ): Promise<ImageUrls[]> {
    return Promise.all(
      images.map((image, index) =>
        this.uploadImage(
          image,
          uploadPreset,
          `${baseImageName}_${index}`,
          options
        )
      )
    );
  }

  async replaceImage(
    oldPublicId: string,
    newImage: ImageBuffer,
    uploadPreset: string,
    imageName: string,
    options: UploadOptions = {}
  ): Promise<ImageUrls> {
    await this.destroyImage(oldPublicId, { invalidate: true });
    return this.uploadImage(newImage, uploadPreset, imageName, options);
  }

  async destroyImage(
    publicId: string,
    options: { invalidate?: boolean } = {}
  ): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, options);
    } catch (error: any) {
      throw new CloudinaryError(
        `Image deletion failed: ${error.message}`,
        error.http_code
      );
    }
  }

  private bufferToDataURI(image: ImageBuffer): string {
    const b64 = Buffer.from(image.buffer).toString("base64");
    return `data:${image.mimetype};base64,${b64}`;
  }

  /**
   * Uploads an image to Cloudinary with enhanced options and error handling
   */
  private async uploadToCloudinary(
    dataURI: string,
    uploadPreset: string,
    imageName: string,
    options: UploadOptions = {}
  ): Promise<UploadApiResponse> {
    try {
      const defaultOptions = {
        upload_preset: uploadPreset,
        public_id: imageName,
        quality: "auto",
        fetch_format: "auto",
        ...options,
      };

      const result = await cloudinary.uploader.upload(dataURI, defaultOptions);
      return result;
    } catch (error: any) {
      const errorMessage = error.message || "Unknown error occurred";
      const errorCode = error.http_code || "500";
      throw new CloudinaryError(
        `Error uploading to Cloudinary: ${errorMessage}`,
        errorCode
      );
    }
  }

  /**
   * Generates optimized image URLs with specified transformations
   */
  private generateImageUrls(
    publicId: string,
    options: {
      format?: string;
      quality?: string;
      defaultTransformation?: Record<string, any>;
    } = {}
  ): ImageUrls {
    const {
      format = "auto",
      quality = "auto",
      defaultTransformation = {},
    } = options;

    const transformImage = (width: number, height: number): string =>
      cloudinary.url(publicId, {
        width,
        height,
        crop: "fit",
        secure: true,
        fetch_format: format,
        quality,
        ...defaultTransformation,
      });

    return {
      publicId,
      tiny: transformImage(IMAGE_SIZES.TINY, IMAGE_SIZES.TINY),
      medium: transformImage(IMAGE_SIZES.MEDIUM, IMAGE_SIZES.MEDIUM),
      large: transformImage(IMAGE_SIZES.LARGE, IMAGE_SIZES.LARGE),
      original: cloudinary.url(publicId, {
        secure: true,
        fetch_format: format,
        quality,
        ...defaultTransformation,
      }),
    };
  }
}
