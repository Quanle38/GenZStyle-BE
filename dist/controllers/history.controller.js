"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const unitOfWork_1 = require("../unit-of-work/unitOfWork");
const order_service_1 = require("../services/order.service");
const handleError_helper_1 = __importDefault(require("../helpers/handleError.helper"));
const handleResponse_helper_1 = __importDefault(require("../helpers/handleResponse.helper"));
// Khai báo service bên ngoài giống userController của bạn
const orderService = new order_service_1.OrderService();
const historyController = {
    /**
     * GET /api/history/my-orders
     * Lấy lịch sử mua hàng cá nhân (Chặn Admin)
     */
    getOrdersByMe: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            // 1. Lấy user từ authMiddleware
            const user = req.user;
            if (!user) {
                return (0, handleError_helper_1.default)(res, 401, "Unauthorized");
            }
            // 2. Check quyền: Nếu là admin thì 403 Forbidden
            if (user.role === "admin") {
                return (0, handleError_helper_1.default)(res, 403, "Admin không có quyền truy cập lịch sử mua hàng cá nhân");
            }
            const userId = user.id;
            // 3. Fetch danh sách đơn hàng lên bằng userId
            // Tận dụng hàm getAllOrders có sẵn trong OrderService của bạn
            const orders = await orderService.getAllOrders(uow, userId);
            return (0, handleResponse_helper_1.default)(res, 200, {
                message: "Lấy lịch sử mua hàng thành công",
                data: orders
            });
        }
        catch (error) {
            console.error("getOrdersByMe error:", error);
            return (0, handleError_helper_1.default)(res, 500, error.message || "Internal server error");
        }
    },
    /**
     * Có thể thêm các hàm khác như getDetailOrderByMe nếu cần
     */
};
exports.default = historyController;
//# sourceMappingURL=history.controller.js.map