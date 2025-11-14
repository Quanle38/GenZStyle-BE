// controllers/coupon.controller.ts
import { Request, Response } from "express";
import handleError from "../helpers/handleError.helper";
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import { CouponService } from "../services/coupon.service";
import { authService } from "../services/auth.service";

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
     * [GET] Lấy danh sách Coupon khả dụng cho User (User View)
     */
    getAllCouponByUserId: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            // **GIẢ ĐỊNH**: userId được lấy từ req.user sau khi Auth Middleware chạy
            const userId = req.query.userId as string; // Thay bằng req.user.id trong thực tế
            
            if (!userId) {
                return handleError(res, 401, "User ID is required.");
            }
            //check user id dang la hang gi

            const coupons = await couponService.getAllCouponByUserId(uow, userId);

            return res.status(200).json({
                success: true,
                data: coupons,
            });
        } catch (error) {
            return handleError(res, 500, error);
        }
    },
    /**
     * [GET] Lấy Coupon theo mã code (Thường dùng cho API công khai/kiểm tra)
     */
    getCouponByCode: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const code = req.query.code as string;
            
            const coupon = await couponService.getCouponByCode(uow, code);

            if (!coupon) {
                return handleError(res, 404, "Coupon not found.");
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
     * [POST] Tạo Coupon mới
     */
    createCoupon: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        try {
            const { conditions = [], ...couponData } = req.body;
            
            await uow.start();
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
     * [POST] Kiểm tra, áp dụng và tăng lượt sử dụng Coupon (Transactional)
     * Body: { code: string, cartInfo: { userId: string, subtotal: number, productIds: string[] } }
     */
    applyCoupon: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        /* phải lấy user để biết là rank gì
           check conditon của coupon 
           lấy condition values
           nếu condition là dạng tier thì so sánh với membership của user
           nếu conditon là dạng   "condition_type": "NEW_USER", thì check user có phải là người dùng mới ko
           nếu condition là dạng 
        */
         
        try {
            const token = req.headers["authorization"]?.split(" ")[1];
            const user = await authService.me(uow, token!);
            const membership = user.membership;
            const { code, cartInfo } = req.body;
            if (!code || !cartInfo) {
                return handleError(res, 400, "Missing coupon code or cart information.");
            }
            const coupon = await couponService.getCouponByCode(uow, code);
            //const condition = coupon?.conditions.
            // 1. Validate và tính chiết khấu (Không cần Transaction ở đây)
            const result = await couponService.applyCoupon(uow, code, cartInfo);

            // 2. Tăng used_count trong Transaction
            await uow.start();
            const incremented = await uow.coupon.incrementUsedCount(result.coupon.id);
            await uow.commit();
            
            if (!incremented) {
                 await uow.rollback(); 
                 throw new Error("Failed to update coupon usage count after successful validation.");
            }

            return res.status(200).json({
                success: true,
                message: "Coupon applied and usage counted successfully",
                discount: result.discountAmount,
                coupon: result.coupon.code
            });
        } catch (error: any) {
            await uow.rollback();
            // Lỗi từ applyCoupon (Validation) hoặc lỗi Increment
            return handleError(res, 400, error.message);
        }
    }
};

export default couponController;