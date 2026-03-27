import { Request, Response } from "express";
import handleError from "../helpers/handleError.helper";
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import { CouponService } from "../services/coupon.service";

const couponService = new CouponService();

const couponController = {
    /**
     * [GET] Lấy danh sách Coupon (Admin - có phân trang & tìm kiếm)
     */
    getAllCoupons: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;

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
        } catch (error: any) {
            return handleError(res, 500, error.message || "Internal Server Error");
        }
    },

    /**
     * [GET] Lấy danh sách Coupon khả dụng cho User hiện tại
     */
    getAllCouponByUserId: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            // Giả định user được lưu vào req từ Middleware Auth
            const user = (req as any).user;
            if (!user) return handleError(res, 401, "Unauthorized");

            const coupons = await couponService.getAllCouponByUserId(uow, user.id, user.membership_id);

            return res.status(200).json({
                success: true,
                data: coupons
            });
        } catch (error: any) {
            return handleError(res, 500, error.message || "Error fetching coupons for user");
        }
    },

    /**
     * [GET] Tìm coupon theo mã code (Sử dụng hàm getCouponByCode nội bộ)
     */
    getCouponByCode: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const { code } = req.params;
            const coupon = await couponService.getCouponByCode(uow, code);

            if (!coupon) return handleError(res, 404, "Coupon not found or expired");

            return res.status(200).json({
                success: true,
                data: coupon
            });
        } catch (error: any) {
            return handleError(res, 500, error.message);
        }
    },

    /**
     * [POST] Tạo Coupon mới (Admin)
     */
    createCoupon: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        await uow.start();
        try {
            const { conditions = [], ...couponData } = req.body;
            const newCoupon = await couponService.createCoupon(uow, couponData, conditions);

            await uow.commit();
            return res.status(201).json({
                success: true,
                data: newCoupon
            });
        } catch (error: any) {
            await uow.rollback();
            return handleError(res, 400, error.message);
        }
    },

    /**
     * [PUT] Cập nhật Coupon (Admin)
     */
    updateCoupon: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
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
        } catch (error: any) {
            await uow.rollback();
            return handleError(res, 400, error.message);
        }
    },

    /**
     * [DELETE] Xóa Coupon (Admin - Soft Delete)
     */
    deleteCoupon: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        await uow.start();
        try {
            const { id } = req.params;
            await couponService.deleteCoupon(uow, id);

            await uow.commit();
            return res.status(200).json({
                success: true,
                message: "Coupon deleted successfully"
            });
        } catch (error: any) {
            await uow.rollback();
            return handleError(res, 400, error.message);
        }
    },

    /**
     * [POST] Áp dụng Coupon vào giỏ hàng (Check out)
     */
    applyCoupon: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        await uow.start();
        try {
            const user = req.user;
            if (!user) {
                return handleError(res, 400, "Do not have user");

            }
            const { code } = req.body;
            const result = await couponService.applyCoupon(uow, code, user?.id)
            console.log(result)
            await uow.commit();
            return res.status(200).json({
                success: true,
                data: {
                    discountAmount: result.discountAmount,
                    couponCode: result.couponCode,
                }
            });
        } catch (error: any) {
            await uow.rollback();
            return handleError(res, 400, error.message);
        }
    }
};

export default couponController;6