// controllers/coupon.controller.ts
import { Request, Response } from "express";
import handleError from "../helpers/handleError.helper";
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import { CouponService } from "../services/coupon.service";

const couponService = new CouponService();

const couponController = {

    /**
     * [GET] Lấy danh sách Coupon có phân trang (Admin/Management)
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
                    limit,
                }
            });
        } catch (error) {
            return handleError(res, 500, error);
        }
    },

    /**
     * ✅ [GET] Lấy danh sách Coupon khả dụng cho User (dùng req.user)
     */
    getAllCouponByUserId: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            // ✅ Lấy user từ req.user (đã được inject bởi authMiddleware)
            const user = req.user;
            
            if (!user) {
                return handleError(res, 401, "User not authenticated.");
            }
            
            // ✅ Dùng thông tin từ req.user
            const coupons = await couponService.getAllCouponByUserId(
                uow, 
                user.id, 
                user.membership_id
            );

            return res.status(200).json({
                success: true,
                data: coupons,
            });
        } catch (error) {
            return handleError(res, 500, error);
        }
    },

    /**
     * [GET] Lấy Coupon theo mã code (Public API)
     */
    getCouponByCode: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const code = req.query.code as string;
            
            if (!code) {
                return handleError(res, 400, "Coupon code is required.");
            }
            
            const coupon = await uow.coupon.findActiveCouponByCode(code); 

            if (!coupon) {
                return handleError(res, 404, "Coupon not found or inactive.");
            }

            return res.status(200).json({
                success: true,
                data: coupon,
            });
        } catch (error) {
            return handleError(res, 500, error);
        }
    },

    /**
     * [POST] Tạo Coupon mới (Transactional)
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
                message: "Coupon created successfully",
                data: newCoupon,
            });
        } catch (error: any) {
            await uow.rollback();
            return handleError(res, 400, error.message);
        }
    },

    /**
     * ✅ [POST] Apply Coupon (dùng req.user)
     */
    applyCoupon: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        await uow.start();

        try {
            // ✅ Lấy user từ req.user (đã được inject bởi authMiddleware)
            const user = req.user;
            
            if (!user) {
                await uow.rollback();
                return handleError(res, 401, "User not authenticated.");
            }
            
            const { code, cartInfo } = req.body;
            
            if (!code || !cartInfo) {
                await uow.rollback();
                return handleError(res, 400, "Missing coupon code or cart information.");
            }
            
            // ✅ Chuẩn bị CartValidationInfo từ req.user
            const fullCartInfo = {
                ...cartInfo,
                userId: user.id,
                userMembershipId: user.membership_id, 
                isNewUser: user.is_new, 
            };
            
            // Validate và tính chiết khấu
            const result = await couponService.applyCoupon(uow, code, fullCartInfo);

            // Tăng used_count trong cùng transaction
            const incremented = await uow.coupon.incrementUsedCount(result.coupon.id);
            
            if (!incremented) {
                throw new Error("Failed to update coupon usage count.");
            }

            await uow.commit();

            return res.status(200).json({
                success: true,
                message: "Coupon applied successfully",
                discount: result.discountAmount,
                coupon: result.coupon.code
            });
            
        } catch (error: any) {
            await uow.rollback();
            return handleError(res, 400, error.message);
        }
    }
};

export default couponController;