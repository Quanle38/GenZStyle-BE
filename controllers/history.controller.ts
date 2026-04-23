import { Request, Response } from "express";
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import { OrderService } from "../services/order.service";
import handleError from "../helpers/handleError.helper";
import handleResponse from "../helpers/handleResponse.helper";

// Khai báo service bên ngoài giống userController của bạn
const orderService = new OrderService();

const historyController = {
  /**
   * GET /api/history/my-orders
   * Lấy lịch sử mua hàng cá nhân (Chặn Admin)
   */
  getOrdersByMe: async (req: Request, res: Response) => {
    const uow = new UnitOfWork();
    try {
      // 1. Lấy user từ authMiddleware
      const user = req.user;

      if (!user) {
        return handleError(res, 401, "Unauthorized");
      }

      // 2. Check quyền: Nếu là admin thì 403 Forbidden
      if (user.role === "admin") {
        return handleError(res, 403, "Admin không có quyền truy cập lịch sử mua hàng cá nhân");
      }

      const userId = user.id;

      // 3. Fetch danh sách đơn hàng lên bằng userId
      // Tận dụng hàm getAllOrders có sẵn trong OrderService của bạn
      const orders = await orderService.getAllOrders(uow, userId);

      return handleResponse(res, 200, {
        message: "Lấy lịch sử mua hàng thành công",
        data: orders
      });

    } catch (error: any) {
      console.error("getOrdersByMe error:", error);
      return handleError(res, 500, error.message || "Internal server error");
    }
  },

  /**
   * Có thể thêm các hàm khác như getDetailOrderByMe nếu cần
   */
};

export default historyController;