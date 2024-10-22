import { Request, Response, NextFunction } from "express";
import multer, { MulterError } from "multer";
import createError from "http-errors";
import sharp from "sharp";
import { ValidationError } from "../errors";

const config = {
  maxFileSize: 1024 * 1024 * 2, // 2MB
  maxFiles: 10,
  allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"] as const,
  maxWidth: 2000,
  maxHeight: 2000,
  quality: 80,
} as const;

// Storage configuration
const multerStorage = multer.memoryStorage();

// File filter with specific mime types
const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (config.allowedTypes.includes(file.mimetype as any)) {
    cb(null, true);
  } else {
    cb(
      new ValidationError(
        `Invalid file type. Only ${config.allowedTypes.join(", ")} are allowed.`
      ) as any,
      false
    );
  }
};

// Multer configuration
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: config.maxFileSize,
  },
});

// Image processing utility
const processImage = async (buffer: Buffer) => {
  const image = sharp(buffer);
  const metadata = await image.metadata();

  if (
    metadata.width! > config.maxWidth ||
    metadata.height! > config.maxHeight
  ) {
    throw new ValidationError(
      `Image dimensions must not exceed ${config.maxWidth}x${config.maxHeight} pixels`
    );
  }

  return image
    .resize(config.maxWidth, config.maxHeight, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: config.quality })
    .toBuffer();
};

// Content-Type validation middleware
const validateContentType = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.is("multipart/form-data")) {
    return next(createError(400, "Content-Type must be multipart/form-data"));
  }
  next();
};

// Multiple images upload middleware
const uploadImages = [
  validateContentType,
  (req: Request, res: Response, next: NextFunction) => {
    const uploadFiles = upload.array("images", config.maxFiles);

    uploadFiles(req, res, async (err: any) => {
      if (err instanceof MulterError) {
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return next(
            createError(
              400,
              `Max number of images allowed is ${config.maxFiles}.`
            )
          );
        }
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(
            createError(
              400,
              `Size of images must not exceed ${
                config.maxFileSize / (1024 * 1024)
              }MB.`
            )
          );
        }
      } else if (err instanceof ValidationError) {
        return next(createError(400, err.message));
      } else if (err) {
        return next(createError(400, err.message));
      }

      // Process uploaded images
      try {
        if (req.files && Array.isArray(req.files)) {
          const processedFiles = await Promise.all(
            req.files.map(async (file) => {
              const processed = await processImage(file.buffer);
              return {
                ...file,
                buffer: processed,
              };
            })
          );
          req.files = processedFiles;
        }
        next();
      } catch (error: any) {
        next(createError(400, error.message));
      }
    });
  },
];

// Single image upload middleware
const uploadSingleImage = [
  validateContentType,
  (req: Request, res: Response, next: NextFunction) => {
    const uploadFile = upload.single("image");

    uploadFile(req, res, async (err: any) => {
      if (err instanceof MulterError) {
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return next(createError(400, "Only 1 image allowed."));
        }
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(
            createError(
              400,
              `Size of image must not exceed ${
                config.maxFileSize / (1024 * 1024)
              }MB.`
            )
          );
        }
      } else if (err instanceof ValidationError) {
        return next(createError(400, err.message));
      } else if (err) {
        return next(createError(400, err.message));
      }

      // Process uploaded image
      try {
        if (req.file) {
          const processed = await processImage(req.file.buffer);
          req.file.buffer = processed;
        }
        next();
      } catch (error: any) {
        next(createError(400, error.message));
      }
    });
  },
];

export { uploadImages, uploadSingleImage };
