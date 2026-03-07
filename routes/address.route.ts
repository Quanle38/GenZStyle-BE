import { Router } from "express";
import userAddressController from "../controllers/address.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { checkRole } from "../middleware/role.middleware";
import { ROLE } from "../enums/role.enum";

const userAddressRouter = Router();

/**
 * ===== PROTECTED - USER =====
 * Yêu cầu đăng nhập
 * User chỉ thao tác trên địa chỉ của CHÍNH MÌNH
 */

// Tạo địa chỉ mới
userAddressRouter.post(
    "/",
    authMiddleware,
    checkRole([ROLE.USER]),
    userAddressController.create
);

// Lấy tất cả địa chỉ của user hiện tại
userAddressRouter.get(
    "/",
    authMiddleware,
    checkRole([ROLE.USER]),
    userAddressController.getAllByUserId
);

// Lấy chi tiết địa chỉ theo id (có check ownership)
userAddressRouter.get(
    "/:id",
    authMiddleware,
    checkRole([ROLE.USER]),
    userAddressController.getById
);

// Cập nhật địa chỉ (có check ownership)
userAddressRouter.put(
    "/:id",
    authMiddleware,
    checkRole([ROLE.USER]),
    userAddressController.update
);

// Xóa mềm địa chỉ (có check ownership)
userAddressRouter.delete(
    "/:id",
    authMiddleware,
    checkRole([ROLE.USER]),
    userAddressController.deleteOne
);

export default userAddressRouter;
