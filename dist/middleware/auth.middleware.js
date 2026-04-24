"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const handleError_helper_1 = __importDefault(require("../helpers/handleError.helper"));
const jwt_helper_1 = require("../helpers/jwt.helper");
const unitOfWork_1 = require("../unit-of-work/unitOfWork");
const authMiddleware = async (req, res, next) => {
    const uow = new unitOfWork_1.UnitOfWork();
    try {
        // ✅ 1. Verify token
        const authHeader = req.headers["authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authorization header is missing or invalid"
            });
        }
        const token = authHeader.split(" ")[1];
        const userPayload = (0, jwt_helper_1.verifyToken)(token);
        if (!userPayload) {
            return (0, handleError_helper_1.default)(res, 401, "Invalid or expired token");
        }
        // ✅ 2. Load full user từ DB (tích hợp luôn)
        const user = await uow.users.findById(userPayload.user_id);
        if (!user) {
            return (0, handleError_helper_1.default)(res, 404, "User not found");
        }
        if (user.is_deleted) {
            return (0, handleError_helper_1.default)(res, 403, "User account has been deleted");
        }
        // ✅ 3. Inject full user vào request
        req.user = user;
        next();
    }
    catch (error) {
        console.error("Auth middleware error:", error);
        return (0, handleError_helper_1.default)(res, 401, error.message || "Authentication failed");
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map