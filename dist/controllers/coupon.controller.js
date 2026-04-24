"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const handleError_helper_1 = __importDefault(require("../helpers/handleError.helper"));
const unitOfWork_1 = require("../unit-of-work/unitOfWork");
const coupon_service_1 = require("../services/coupon.service");
const couponService = new coupon_service_1.CouponService();
const couponController = {
    /**
     * [GET] Lấy danh sách Coupon (Admin - có phân trang & tìm kiếm)
     */
    getAllCoupons: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search;
            const result = await couponService.getAllcoupon(uow, page, limit, search);
            return res.status(200).json({
                success: true,
                data: result.rows,
                pagination: {
                    total: result.count,
                    page,
                    limit
                }
            });
        }
        catch (error) {
            return (0, handleError_helper_1.default)(res, 500, error.message || "Internal Server Error");
        }
    },
    /**
     * [GET] Lấy danh sách Coupon khả dụng cho User hiện tại
     */
    getAllCouponByUserId: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            // Giả định user được lưu vào req từ Middleware Auth
            const user = req.user;
            if (!user)
                return (0, handleError_helper_1.default)(res, 401, "Unauthorized");
            const coupons = await couponService.getAllCouponByUserId(uow, user.id, user.membership_id);
            return res.status(200).json({
                success: true,
                data: coupons
            });
        }
        catch (error) {
            return (0, handleError_helper_1.default)(res, 500, error.message || "Error fetching coupons for user");
        }
    },
    /**
     * [GET] Tìm coupon theo mã code (Sử dụng hàm getCouponByCode nội bộ)
     */
    getCouponByCode: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        try {
            const { code } = req.params;
            const coupon = await couponService.getCouponByCode(uow, code);
            if (!coupon)
                return (0, handleError_helper_1.default)(res, 404, "Coupon not found or expired");
            return res.status(200).json({
                success: true,
                data: coupon
            });
        }
        catch (error) {
            return (0, handleError_helper_1.default)(res, 500, error.message);
        }
    },
    /**
     * [POST] Tạo Coupon mới (Admin)
     */
    createCoupon: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        await uow.start();
        try {
            const { conditions = [], ...couponData } = req.body;
            const newCoupon = await couponService.createCoupon(uow, couponData, conditions);
            await uow.commit();
            return res.status(201).json({
                success: true,
                data: newCoupon
            });
        }
        catch (error) {
            await uow.rollback();
            return (0, handleError_helper_1.default)(res, 400, error.message);
        }
    },
    /**
     * [PUT] Cập nhật Coupon (Admin)
     */
    updateCoupon: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        await uow.start();
        try {
            const { id } = req.params;
            const { conditions, ...updateData } = req.body;
            const result = await couponService.updateCoupon(uow, id, updateData, conditions);
            await uow.commit();
            return res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            await uow.rollback();
            return (0, handleError_helper_1.default)(res, 400, error.message);
        }
    },
    /**
     * [DELETE] Xóa Coupon (Admin - Soft Delete)
     */
    deleteCoupon: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        await uow.start();
        try {
            const { id } = req.params;
            await couponService.deleteCoupon(uow, id);
            await uow.commit();
            return res.status(200).json({
                success: true,
                message: "Coupon deleted successfully"
            });
        }
        catch (error) {
            await uow.rollback();
            return (0, handleError_helper_1.default)(res, 400, error.message);
        }
    },
    /**
     * [POST] Áp dụng Coupon vào giỏ hàng (Check out)
     */
    applyCoupon: async (req, res) => {
        const uow = new unitOfWork_1.UnitOfWork();
        await uow.start();
        try {
            const user = req.user;
            if (!user) {
                return (0, handleError_helper_1.default)(res, 400, "Do not have user");
            }
            const { code } = req.body;
            const result = await couponService.applyCoupon(uow, code, user?.id);
            console.log(result);
            await uow.commit();
            return res.status(200).json({
                success: true,
                data: {
                    discountAmount: result.discountAmount,
                    couponCode: result.couponCode,
                }
            });
        }
        catch (error) {
            await uow.rollback();
            return (0, handleError_helper_1.default)(res, 400, error.message);
        }
    }
};
exports.default = couponController;
6;
//# sourceMappingURL=coupon.controller.js.map