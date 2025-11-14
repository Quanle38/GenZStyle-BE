import { Router } from "express";
import couponController from "../controllers/coupon.controller";

// Khởi tạo Router
const couponRouter = Router();

// --- 1. ADMIN/MANAGEMENT ROUTES (GET) ---
// Lấy tất cả coupon (có phân trang, tìm kiếm)
couponRouter.get("/", couponController.getAllCoupons);

// --- 2. USER VIEW ROUTES (GET) ---
// Lấy tất cả coupon khả dụng cho một user (Yêu cầu userId)
// Thường là GET /api/coupons/available hoặc GET /api/coupons/user
couponRouter.get("/get-all-by-user-id", couponController.getAllCouponByUserId);

// Lấy thông tin coupon theo mã code (Dùng để hiển thị chi tiết)
couponRouter.get("/get-by-code", couponController.getCouponByCode);

// --- 3. MUTATION ROUTES (POST) ---
// Tạo coupon mới (Cần authentication và authorization cho Admin)
couponRouter.post("/create", couponController.createCoupon);

// Áp dụng coupon vào giỏ hàng (Cần authentication của User)
// Route này chạy logic validation và tăng count trong transaction
couponRouter.post("/apply-coupon", couponController.applyCoupon);

export default couponRouter;