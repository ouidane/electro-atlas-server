"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSingleImage = exports.uploadImages = void 0;
const multer_1 = __importStar(require("multer"));
const http_errors_1 = __importDefault(require("http-errors"));
const multerStorage = multer_1.default.memoryStorage();
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    }
    else {
        cb(new Error("Please upload only images."), false);
    }
};
const upload = (0, multer_1.default)({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: {
        fileSize: 1024 * 1024 * 2,
    },
});
const uploadImages = (req, res, next) => {
    const uploadFiles = upload.array("images", 10);
    uploadFiles(req, res, (err) => {
        if (err instanceof multer_1.MulterError) {
            if (err.code === "LIMIT_UNEXPECTED_FILE") {
                return next((0, http_errors_1.default)(400, "Max Number Of Images Allowed Is 10."));
            }
            if (err.code === "LIMIT_FILE_SIZE") {
                return next((0, http_errors_1.default)(400, "Size of Images Must Not Exceed 2 MB."));
            }
        }
        else if (err) {
            return next((0, http_errors_1.default)(400, err));
        }
        next();
    });
};
exports.uploadImages = uploadImages;
const uploadSingleImage = (req, res, next) => {
    const uploadFile = upload.single("image");
    uploadFile(req, res, (err) => {
        if (err instanceof multer_1.MulterError) {
            if (err.code === "LIMIT_UNEXPECTED_FILE") {
                return next((0, http_errors_1.default)(400, "Only 1 Image Allowed."));
            }
            if (err.code === "LIMIT_FILE_SIZE") {
                return next((0, http_errors_1.default)(400, "Size of Image Must Not Exceed 2 MB."));
            }
        }
        else if (err) {
            return next((0, http_errors_1.default)(400, err));
        }
        next();
    });
};
exports.uploadSingleImage = uploadSingleImage;
//# sourceMappingURL=multer.js.map