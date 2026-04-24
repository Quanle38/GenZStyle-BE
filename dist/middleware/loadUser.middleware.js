"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadUserMiddleware = void 0;
const handleError_helper_1 = __importDefault(require("../helpers/handleError.helper"));
const unitOfWork_1 = require("../unit-of-work/unitOfWork");
/**
 * ✅ Middleware này phải chạy SAU authMiddleware
 * Nó sẽ lấy full User object từ DB dựa trên req.user.user_id
 */
const loadUserMiddleware = async (req, res, next) => {
    const uow = new unitOfWork_1.UnitOfWork();
    try {
        // ✅ Kiểm tra req.user đã tồn tại (từ authMiddleware)
        if (!req.user || !req.user.id) {
            return (0, handleError_helper_1.default)(res, 401, "User not authenticated");
        }
        // ✅ Lấy full user từ DB
        const user = await uow.users.findById(req.user.id);
        if (!user) {
            return (0, handleError_helper_1.default)(res, 404, "User not found");
        }
        if (user.is_deleted) {
            return (0, handleError_helper_1.default)(res, 403, "User account has been deleted");
        }
        // ✅ Ghi đè req.user với full User object
        req.user = user;
        next();
    }
    catch (error) {
        console.error("Load user middleware error:", error);
        return (0, handleError_helper_1.default)(res, 500, error.message || "Failed to load user");
    }
};
exports.loadUserMiddleware = loadUserMiddleware;
//# sourceMappingURL=loadUser.middleware.js.map