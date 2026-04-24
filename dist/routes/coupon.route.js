"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const coupon_controller_1 = __importDefault(require("../controllers/coupon.controller"));
const role_middleware_1 = require("../middleware/role.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_enum_1 = require("../enums/role.enum");
const couponRouter = (0, express_1.Router)();
// --- 1. ADMIN/MANAGEMENT ROUTES (Quản lý Coupon) ---
// Lấy tất cả coupon (Dành cho Admin/Manager quản lý hệ thống)
couponRouter.get("/", auth_middleware_1.authMiddleware, 
//checkRole([ROLE.ADMIN]), 
coupon_controller_1.default.getAllCoupons);
// Tạo coupon mới
couponRouter.post("/create", auth_middleware_1.authMiddleware, 
//checkRole([ROLE.ADMIN]), 
coupon_controller_1.default.createCoupon);
// Cập nhật thông tin Coupon và Điều kiện đi kèm
couponRouter.put("/update/:id", auth_middleware_1.authMiddleware, 
//checkRole([ROLE.ADMIN]), 
coupon_controller_1.default.updateCoupon);
// Xóa Coupon (Soft Delete)
couponRouter.delete("/delete/:id", auth_middleware_1.authMiddleware, 
//checkRole([ROLE.ADMIN]), 
coupon_controller_1.default.deleteCoupon);
// --- 2. USER ROUTES (Dành cho khách hàng) ---
// Lấy tất cả coupon khả dụng cho user (để hiển thị trong ví voucher/giỏ hàng)
couponRouter.get("/get-all-by-user-id", auth_middleware_1.authMiddleware, (0, role_middleware_1.checkRole)([role_enum_1.ROLE.USER, role_enum_1.ROLE.ADMIN]), coupon_controller_1.default.getAllCouponByUserId);
// Lấy thông tin chi tiết của 1 coupon qua mã code (Ví dụ: để kiểm tra trước khi nhập)
couponRouter.get("/get-by-code/:code", auth_middleware_1.authMiddleware, coupon_controller_1.default.getCouponByCode);
// Áp dụng coupon vào đơn hàng (Tính toán giảm giá và trừ lượt dùng)
couponRouter.post("/apply-coupon", auth_middleware_1.authMiddleware, (0, role_middleware_1.checkRole)([role_enum_1.ROLE.USER, role_enum_1.ROLE.ADMIN]), coupon_controller_1.default.applyCoupon);
exports.default = couponRouter;
//# sourceMappingURL=coupon.route.js.map