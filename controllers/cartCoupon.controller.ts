import { Request, Response } from "express";
import handleError from "../helpers/handleError.helper";
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import { CartCouponService } from "../services/cartCoupon.service";

const cartCouponService = new CartCouponService();

const cartCouponController = {

    /**
     * [POST] Áp dụng coupon vào giỏ hàng
     * POST /api/v1/carts/coupons
     * Body: { coupon_code: string }
     */
    applyCoupon: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const user: any = req.user;
            if (!user?.id) return handleError(res, 401, "User not authenticated.");

            const { coupon_code } = req.body;
            if (!coupon_code) return handleError(res, 400, "Missing coupon_code.");

            await uow.start();
            const cartCoupon = await cartCouponService.applyCoupon(uow, user.id, coupon_code);
            await uow.commit();

            return res.status(201).json({
                success: true,
                message: "Coupon applied successfully.",
                data: cartCoupon
            });
        } catch (error: any) {
            await uow.rollback();
            console.error("CartCouponController: applyCoupon failed", error);
            return handleError(res, 400, error.message || "Failed to apply coupon.");
        }
    },

    /**
     * [DELETE] Xóa coupon khỏi giỏ hàng
     * DELETE /api/v1/carts/coupons/:couponId
     */
    removeCoupon: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const user: any = req.user;
            if (!user?.id) return handleError(res, 401, "User not authenticated.");

            const { couponId } = req.params;
            if (!couponId) return handleError(res, 400, "Missing couponId.");

            await uow.start();
            await cartCouponService.removeCoupon(uow, user.id, couponId);
            await uow.commit();

            return res.status(200).json({
                success: true,
                message: "Coupon removed from cart."
            });
        } catch (error: any) {
            await uow.rollback();
            console.error("CartCouponController: removeCoupon failed", error);
            return handleError(res, 400, error.message || "Failed to remove coupon.");
        }
    },

    /**
     * [GET] Lấy danh sách coupon đang áp dụng
     * GET /api/v1/carts/coupons
     */
    getCoupons: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const user: any = req.user;
            if (!user?.id) return handleError(res, 401, "User not authenticated.");

            const coupons = await cartCouponService.getCouponsOfCart(uow, user.id);

            return res.status(200).json({
                success: true,
                message: "Fetched applied coupons successfully.",
                data: coupons
            });
        } catch (error: any) {
            console.error("CartCouponController: getCoupons failed", error);
            return handleError(res, 500, error.message || "Failed to fetch coupons.");
        }
    }
};

export default cartCouponController;