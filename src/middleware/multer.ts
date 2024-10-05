import { Request, Response, NextFunction } from "express";
import multer, { MulterError } from "multer";
import createError from "http-errors";

const multerStorage = multer.memoryStorage();

const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Please upload only images.") as any, false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 1024 * 1024 * 2,
  },
});

const uploadImages = (req: Request, res: Response, next: NextFunction) => {
  const uploadFiles = upload.array("images", 10);
  uploadFiles(req, res, (err: any) => {
    if (err instanceof MulterError) {
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return next(createError(400, "Max Number Of Images Allowed Is 10."));
      }
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(createError(400, "Size of Images Must Not Exceed 2 MB."));
      }
    } else if (err) {
      return next(createError(400, err));
    }

    next();
  });
};

const uploadSingleImage = (req: Request, res: Response, next: NextFunction) => {
  const uploadFile = upload.single("image");
  uploadFile(req, res, (err: any) => {
    if (err instanceof MulterError) {
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return next(createError(400, "Only 1 Image Allowed."));
      }
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(createError(400, "Size of Image Must Not Exceed 2 MB."));
      }
    } else if (err) {
      return next(createError(400, err));
    }

    next();
  });
};

export { uploadImages, uploadSingleImage };
