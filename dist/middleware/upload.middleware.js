"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.default,
    params: async (req, file) => {
        return {
            folder: "genzstyle/users", // thư mục trên Cloudinary
            allowed_formats: ["jpg", "jpeg", "png", "webp"],
            public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
            transformation: [
                { width: 800, height: 800, crop: "limit" }
            ]
        };
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});
exports.default = upload;
//# sourceMappingURL=upload.middleware.js.map