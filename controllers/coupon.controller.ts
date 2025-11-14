// controllers/coupon.controller.ts
import { Request, Response } from "express";
import handleError from "../helpers/handleError.helper";
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import { CouponService } from "../services/coupon.service";
import { authService } from "../services/auth.service"; // Giả định service này trả về User có membership

const couponService = new CouponService();

const couponController = {

    /**
     * [GET] Lấy danh sách Coupon có phân trang (Admin/Management)
     */
    getAllCoupons: async (req: Request, res: Response) => {
        const uow = new UnitOfWork(); // Không cần transaction
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
        const uow = new UnitOfWork(); // Không cần transaction
        try {
            // **GIẢ ĐỊNH**: userId được lấy từ req.query
            const userId = req.query.userId as string; 
            
            if (!userId) {
                return handleError(res, 401, "User ID is required.");
            }
            
            // Lấy thông tin User để xác định Membership Tier
            const user = await uow.users.getTierByUserId(userId); // Giả định repo có hàm này
            
            if (!user) {
                 return handleError(res, 404, "User or Membership not found.");
            }
            
            const userMembershipId = user.membership_id; // Lấy ID của Membership Tier
            
            const coupons = await couponService.getAllCouponByUserId(uow, userId, userMembershipId);

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
        const uow = new UnitOfWork(); // Không cần transaction
        try {
            const code = req.query.code as string;
            
            // Sử dụng findActiveCouponByCode để lấy coupon và tất cả điều kiện kèm theo
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
        await uow.start(); // ➡️ BẮT ĐẦU TRANSACTION
        try {
            // Giả định couponData chứa condition_set_id hoặc logic tạo set mới nằm trong service
            const { conditions = [], ...couponData } = req.body; 
            
            // Hàm service xử lý/tạo ConditionSet
            const newCoupon = await couponService.createCoupon(uow, couponData, conditions); 
            
            await uow.commit(); // ➡️ COMMIT TRANSACTION

            return res.status(201).json({
                success: true,
                message: "Coupon created successfully",
                data: newCoupon,
            });
        } catch (error: any) {
            await uow.rollback(); // ➡️ ROLLBACK
            return handleError(res, 400, error.message);
        }
    },

    /**
     * [POST] Kiểm tra, áp dụng và tăng lượt sử dụng Coupon (Transactional)
     */
    applyCoupon: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        // **LƯU Ý:** Do logic của bạn tách riêng Validate/Calculate (Service) và Increment (Controller)
        // Ta cần bọc toàn bộ trong một Transaction duy nhất để đảm bảo Atomicity.
        await uow.start(); // ➡️ BẮT ĐẦU TRANSACTION bao gồm cả validation và increment

        try {
            // 1. Xác thực người dùng và lấy thông tin cần thiết
            const token = req.headers["authorization"]?.split(" ")[1];
            if (!token) {
                 await uow.rollback();
                 return handleError(res, 401, "Authorization token is missing.");
            }
            
            // authService.me sử dụng UOW để truy vấn user (cần đảm bảo nó không tự commit/rollback)
            const user = await authService.me(uow, token); 
            
            if (!user) {
                 await uow.rollback();
                 return handleError(res, 401, "User not found or token invalid.");
            }
            
            const { code, cartInfo } = req.body;
            
            if (!code || !cartInfo) {
                await uow.rollback();
                return handleError(res, 400, "Missing coupon code or cart information.");
            }
            
            // Chuẩn bị CartValidationInfo đầy đủ 
            const fullCartInfo = {
                ...cartInfo,
                userId: user.id,
                userMembershipId: user.membership_id, 
                isNewUser: user.is_new, 
            };
            
            // 2. Validate và tính chiết khấu (Service KHÔNG tăng count)
            // Việc này chạy trong Transaction đã start
            const result = await couponService.applyCoupon(uow, code, fullCartInfo);

            // 3. Tăng used_count trong CÙNG TRANSACTION (atomic with validation)
            const incremented = await uow.coupon.incrementUsedCount(result.coupon.id);
            
            if (!incremented) {
                // Nếu tăng count thất bại, ném lỗi để chuyển sang block catch và rollback
                 throw new Error("Failed to update coupon usage count.");
            }

            await uow.commit(); // ➡️ COMMIT TRANSACTION

            return res.status(200).json({
                success: true,
                message: "Coupon applied and usage counted successfully",
                discount: result.discountAmount,
                coupon: result.coupon.code
            });
            
        } catch (error: any) {
            await uow.rollback(); // ➡️ ROLLBACK nếu có bất kỳ lỗi nào (validation, increment, auth, etc.)
            // Lỗi từ applyCoupon (Validation) hoặc lỗi Increment
            return handleError(res, 400, error.message);
        }
    }
};

export default couponController;