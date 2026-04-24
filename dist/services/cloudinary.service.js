"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
class CloudinaryService {
    /**
     * Tải tệp tin lên Cloudinary từ Buffer.
     * @param fileBuffer Buffer của tệp tin được tải lên (ví dụ: từ multer).
     * @param mimeType MIME type của tệp tin (ví dụ: 'image/jpeg', 'image/png').
     * @param folderName Tên thư mục (folder) để lưu tệp tin trên Cloudinary. Mặc định là AVATAR.
     * @returns URL an toàn của tệp tin đã tải lên.
     */
    async saveToCloud(fileBuffer, mimeType, folderName = "AVATAR") {
        try {
            // 1. Chuyển Buffer thành Data URI (chuỗi Base64)
            // Cần có mimeType để tạo đúng định dạng: data:<mimeType>;base64,<base64_data>
            const dataUri = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
            // 2. Tải Data URI lên Cloudinary
            const result = await cloudinary_1.default.uploader.upload(dataUri, {
                folder: folderName,
                // Các tùy chọn khác như public_id, resource_type, v.v.
            });
            console.log("Cloudinary Upload Success:", result.secure_url);
            // Trả về URL an toàn (HTTPS) của tệp tin đã tải lên
            return result.secure_url;
        }
        catch (err) {
            console.error("Cloudinary Upload Error:", err);
            // Trả về null hoặc ném lỗi nếu quá trình tải lên thất bại
            return null;
        }
    }
}
exports.CloudinaryService = CloudinaryService;
//# sourceMappingURL=cloudinary.service.js.map