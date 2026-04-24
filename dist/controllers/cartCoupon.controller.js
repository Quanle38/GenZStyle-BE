"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const handleError_helper_1 = __importDefault(require("../helpers/handleError.helper"));
const unitOfWork_1 = require("../unit-of-work/unitOfWork");
const cartCoupon_service_1 = require("../services/cartCoupon.service");
const cartCouponService = new cartCoupon_service_1.CartCouponService();
const cartCouponController = {
    /**
     * [POST] Áp dụng coupon vào giỏ hàng
     * POST /api/v1/carts/coupons
     * Body: { coupon_code: string }
     */
    applyCoupon: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const user = req.user;
            if (!user?.id)
                return (0, handleError_helper_1.default)(res, 401, "User not authenticated.");
            const { coupon_code } = req.body;
            if (!coupon_code)
                return (0, handleError_helper_1.default)(res, 400, "Missing coupon_code.");
            await uow.start();
            const cartCoupon = await cartCouponService.applyCoupon(uow, user.id, coupon_code);
            await uow.commit();
            return res.status(201).json({
                success: true,
                message: "Coupon applied successfully.",
                data: cartCoupon
            });
        }
        catch (error) {
            await uow.rollback();
            console.error("CartCouponController: applyCoupon failed", error);
            return (0, handleError_helper_1.default)(res, 400, error.message || "Failed to apply coupon.");
        }
    },
    /**
     * [DELETE] Xóa coupon khỏi giỏ hàng
     * DELETE /api/v1/carts/coupons/:couponId
     */
    removeCoupon: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const user = req.user;
            if (!user?.id)
                return (0, handleError_helper_1.default)(res, 401, "User not authenticated.");
            const { couponId } = req.params;
            if (!couponId)
                return (0, handleError_helper_1.default)(res, 400, "Missing couponId.");
            await uow.start();
            await cartCouponService.removeCoupon(uow, user.id, couponId);
            await uow.commit();
            return res.status(200).json({
                success: true,
                message: "Coupon removed from cart."
            });
        }
        catch (error) {
            await uow.rollback();
            console.error("CartCouponController: removeCoupon failed", error);
            return (0, handleError_helper_1.default)(res, 400, error.message || "Failed to remove coupon.");
        }
    },
    /**
     * [GET] Lấy danh sách coupon đang áp dụng
     * GET /api/v1/carts/coupons
     */
    getCoupons: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const user = req.user;
            if (!user?.id)
                return (0, handleError_helper_1.default)(res, 401, "User not authenticated.");
            const coupons = await cartCouponService.getCouponsOfCart(uow, user.id);
            return res.status(200).json({
                success: true,
                message: "Fetched applied coupons successfully.",
                data: coupons
            });
        }
        catch (error) {
            console.error("CartCouponController: getCoupons failed", error);
            return (0, handleError_helper_1.default)(res, 500, error.message || "Failed to fetch coupons.");
        }
    }
};
exports.default = cartCouponController;
//# sourceMappingURL=cartCoupon.controller.js.map