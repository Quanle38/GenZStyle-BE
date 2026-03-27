import { Router } from "express";
import couponController from "../controllers/coupon.controller";
import { checkRole } from "../middleware/role.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { ROLE } from "../enums/role.enum";

const couponRouter = Router();

// --- 1. ADMIN/MANAGEMENT ROUTES (Quản lý Coupon) ---

// Lấy tất cả coupon (Dành cho Admin/Manager quản lý hệ thống)
couponRouter.get(
    "/", 
    authMiddleware, 
    checkRole([ROLE.ADMIN]), 
    couponController.getAllCoupons
);

// Tạo coupon mới
couponRouter.post(
    "/create", 
    authMiddleware, 
    checkRole([ROLE.ADMIN]), 
    couponController.createCoupon
);

// Cập nhật thông tin Coupon và Điều kiện đi kèm
couponRouter.put(
    "/update/:id", 
    authMiddleware, 
    checkRole([ROLE.ADMIN]), 
    couponController.updateCoupon
);

// Xóa Coupon (Soft Delete)
couponRouter.delete(
    "/delete/:id", 
    authMiddleware, 
    checkRole([ROLE.ADMIN]), 
    couponController.deleteCoupon
);


// --- 2. USER ROUTES (Dành cho khách hàng) ---

// Lấy tất cả coupon khả dụng cho user (để hiển thị trong ví voucher/giỏ hàng)
couponRouter.get(
    "/get-all-by-user-id", 
    authMiddleware, 
    checkRole([ROLE.USER, ROLE.ADMIN]), 
    couponController.getAllCouponByUserId
);

// Lấy thông tin chi tiết của 1 coupon qua mã code (Ví dụ: để kiểm tra trước khi nhập)
couponRouter.get(
    "/get-by-code/:code", 
    authMiddleware, 
    couponController.getCouponByCode
);

// Áp dụng coupon vào đơn hàng (Tính toán giảm giá và trừ lượt dùng)
couponRouter.post(
    "/apply-coupon", 
    authMiddleware, 
    checkRole([ROLE.USER, ROLE.ADMIN]), 
    couponController.applyCoupon
);

export default couponRouter;