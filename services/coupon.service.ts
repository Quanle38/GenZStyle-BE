// services/coupon.service.ts
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import { Coupon } from "../models/coupon.model";
import { CouponCondition } from "../models/couponCondition.model";
import { CouponCreationAttributes } from "../models/coupon.model";
import { Op } from "sequelize";

// Dùng cho hàm getAllCouponByUserId
interface CouponInfo extends Coupon {
    is_valid: boolean;
}

export class CouponService {

    /**
     * Lấy tất cả coupon chưa bị xóa (có phân trang và tìm kiếm). (Admin/Management view)
     */
    async getAllcoupon(uow: UnitOfWork, page: number, limit: number, search?: string): Promise<{ rows: Coupon[], count: number }> {
        const offset = (page - 1) * limit;
        let where: any = { is_deleted: false };

        if (search) {
            where[Op.or] = [
                { code: { [Op.iLike]: `%${search}%` } },
            ];
        }

        return uow.coupon.findAndCountAll({
            where,
            limit,
            offset,
            order: [['created_at', 'DESC']],
            include: ['conditions']
        });
    }

    /**
     * Lấy tất cả coupon mà User có thể thấy, bao gồm trạng thái hợp lệ. (User view)
     */
    async getAllCouponByUserId(uow: UnitOfWork, userId: string): Promise<CouponInfo[]> {
        const allcoupon = await uow.coupon.findAll({
            where: {
                is_deleted: false,
                // Chỉ lấy những coupon không có điều kiện APPLY_TO_USER hoặc có điều kiện là User này
                [Op.or]: [
                    { '$conditions.condition_type$': { [Op.ne]: 'APPLY_TO_USER' } },
                    { 
                        [Op.and]: [
                            { '$conditions.condition_type$': 'APPLY_TO_USER' },
                            { '$conditions.condition_value$': userId }
                        ]
                    }
                ]
            },
            include: [{
                model: CouponCondition,
                as: 'conditions',
                where: { is_deleted: false },
                required: false // LEFT JOIN
            }],
            group: ['Coupon.id', 'conditions.condition_id'],
            order: [['created_at', 'DESC']]
        });
        
        const now = new Date();
        
        return allcoupon.map(coupon => ({
            ...coupon.toJSON(),
            is_valid: (
                coupon.start_time <= now &&
                coupon.end_time >= now &&
                coupon.used_count < coupon.usage_limit
            )
        })) as CouponInfo[];
    }
    
    /**
     * Lấy Coupon theo mã code. (Dùng nội bộ)
     */
    async getCouponByCode(uow: UnitOfWork, code: string): Promise<Coupon | null> {
        return uow.coupon.findOne({
            where: { code, is_deleted: false },
            include: ['conditions']
        });
    }

    /**
     * Tạo một Coupon mới cùng với các điều kiện liên quan.
     */
    async createCoupon(
        uow: UnitOfWork, 
        couponData: Partial<CouponCreationAttributes>, 
        conditions: Array<Partial<CouponCondition>> = []
    ): Promise<Coupon> {
        if (!couponData.code || !couponData.start_time || !couponData.end_time || couponData.value === undefined) {
             throw new Error("Missing essential coupon data.");
        }
        if (new Date(couponData.start_time) >= new Date(couponData.end_time)) {
             throw new Error("Start time must be before end time.");
        }

        const newCoupon = await uow.coupon.create(couponData);

        if (conditions.length > 0) {
            const conditionRecords = conditions.map(c => ({
                ...c,
                coupon_id: newCoupon.id,
                is_deleted: false
            }));
            // Giả định uow.couponConditions là Repository cho CouponCondition
            await uow.couponCondition.bulkCreate(conditionRecords); 
        }

        return newCoupon;
    }

    /**
     * Kiểm tra và áp dụng Coupon vào giỏ hàng.
     */
  async applyCoupon(uow: UnitOfWork, code: string, cartInfo: { userId: string, subtotal: number, productIds: string[] }): Promise<{ discountAmount: number, coupon: Coupon }> {
        
        // 1. Tìm và kiểm tra trạng thái hoạt động/hết hạn của Coupon
        // Đảm bảo findActiveCouponByCode đã include: ['conditions']
        const coupon = await uow.coupon.findActiveCouponByCode(code); 
        if (!coupon) {
            throw new Error("Coupon is invalid, expired, or not active.");
        }
        
        // 2. Kiểm tra giới hạn sử dụng
        if (coupon.used_count >= coupon.usage_limit) {
             throw new Error("Coupon has reached its usage limit.");
        }

        // 3. Kiểm tra điều kiện (Conditions)
        // SỬA LỖI TẠI ĐÂY: Dùng thuộc tính 'conditions' đã được Eager Load
        // Lỗi: const conditions = coupon.getConditions || [];
        // Sửa: Dùng thuộc tính conditions
        const conditions = coupon.conditions || []; 

        if (conditions.length === 0) {
             // Thêm kiểm tra nếu không có điều kiện nào được tải.
             // (Nếu không có điều kiện, mặc định là áp dụng được)
        }
        
        for (const condition of conditions) {
            switch (condition.condition_type) {
                case 'MIN_ORDER_VALUE':
                    // Đảm bảo condition_value có thể chuyển sang số
                    if (cartInfo.subtotal < parseFloat(condition.condition_value)) {
                        throw new Error(`Minimum order value of ${condition.condition_value} is required.`);
                    }
                    break;
                case 'APPLY_TO_USER':
                    if (condition.condition_value !== cartInfo.userId) {
                        throw new Error(`This coupon is not applicable to your account.`);
                    }
                    break;
                case 'APPLY_TO_PRODUCT':
                    // Giả định condition_value là ID sản phẩm hoặc danh sách ID
                    const requiredProductId = condition.condition_value; 
                    if (!cartInfo.productIds.includes(requiredProductId)) {
                        throw new Error(`Coupon requires product ID ${requiredProductId} in cart.`);
                    }
                    break;
                // Thêm các trường hợp khác (APPLY_TO_CATEGORY)
            }
        }
        
        // 4. Tính toán chiết khấu (Giữ nguyên logic này)
        let discount = 0;
        if (coupon.type === 'PERCENT') {
            discount = cartInfo.subtotal * (coupon.value / 100);
            if (coupon.max_discount && discount > coupon.max_discount) {
                discount = coupon.max_discount;
            }
        } else if (coupon.type === 'FIXED') {
            discount = coupon.value;
        }

        // 5. Trả về kết quả
        return { discountAmount: discount, coupon };
    }
}