// services/coupon.service.ts
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import { Coupon, CouponCreationAttributes } from "../models/coupon.model";
import { ConditionSet } from "../models/conditionSets.model"; // Đã sửa import path
import { ConditionDetail, CouponConditionType } from "../models/conditionDetail.model";
import { Op, FindOptions } from "sequelize";

interface CouponInfo extends Coupon {
    is_valid: boolean;
}

interface CartValidationInfo {
    userId: string;
    subtotal: number;
    productIds: string[];
    userMembershipId: string;
    isNewUser: boolean;
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
            include: [{
                model: ConditionSet, 
                as: 'conditionSet', 
                include: [{
                    model: ConditionDetail,
                    as: 'details'
                }]
            }]
        });
    }

    /**
     * Lấy tất cả coupon mà User có thể thấy, bao gồm trạng thái hợp lệ. (User view)
     */
    async getAllCouponByUserId(uow: UnitOfWork, userId: string, userMembershipId: string): Promise<CouponInfo[]> {
        const options: FindOptions<Coupon> = {
            where: { is_deleted: false },
            include: [{
                model: ConditionSet, 
                as: 'conditionSet', 
                include: [{
                    model: ConditionDetail,
                    as: 'details',
                    where: { is_deleted: false },
                    required: false 
                }]
            }],
            order: [['created_at', 'DESC']]
        };

        // Sử dụng hàm mới findActiveCoupons từ Repository
        const activeCoupons = await uow.coupon.findActiveCoupons(options);
        
        const now = new Date();
        const results: CouponInfo[] = [];

        for (const coupon of activeCoupons) {
            const isValidTimeAndUsage = (
                coupon.start_time <= now &&
                coupon.end_time >= now &&
                coupon.used_count < coupon.usage_limit
            );

            let isApplicableToUser = true;
            const details = coupon.conditionSet?.details || [];

            for (const detail of details) {
                switch (detail.condition_type as CouponConditionType) {
                    case 'TIER':
                        if (detail.condition_value !== userMembershipId) {
                            isApplicableToUser = false;
                        }
                        break;
                    case 'NEW_USER':
                        // Giả định uow.user.isNewUser(userId) tồn tại và trả về boolean
                        if (detail.condition_value === 'true' && !await uow.users.isNewUser(userId)) {
                            isApplicableToUser = false;
                        }
                        break;
                    // Điều kiện thời gian lặp lại không cần kiểm tra ở đây, vì chúng chỉ giới hạn thời gian sử dụng, không giới hạn khả năng thấy coupon.
                }
            }

            if (isApplicableToUser) {
                 results.push({
                    ...coupon.toJSON(),
                    is_valid: isValidTimeAndUsage
                } as CouponInfo);
            }
        }
        
        return results;
    }
    
    /**
     * Lấy Coupon theo mã code. (Dùng nội bộ)
     */
    async getCouponByCode(uow: UnitOfWork, code: string): Promise<Coupon | null> {
        return uow.coupon.findActiveCouponByCode(code); 
    }

    /**
     * Tạo một Coupon mới cùng với các điều kiện liên quan.
     */
    async createCoupon(
        uow: UnitOfWork, 
        couponData: Partial<CouponCreationAttributes>, 
        conditions: Array<Partial<ConditionDetail>> = []
    ): Promise<Coupon> {
        if (!couponData.code || !couponData.start_time || !couponData.end_time || couponData.value === undefined) {
             throw new Error("Missing essential coupon data.");
        }
        if (new Date(couponData.start_time) >= new Date(couponData.end_time)) {
             throw new Error("Start time must be before end time.");
        }

        let conditionSetId = couponData.condition_set_id;

        if (!conditionSetId && conditions.length > 0) {
             const newSet = await uow.conditionSet.create({
                 name: `Set for ${couponData.code}`,
                 is_reusable: false,
             });
             conditionSetId = newSet.id;

             const detailRecords = conditions.map(c => ({
                 ...c,
                 condition_set_id: newSet.id,
                 is_deleted: false
             }));
             await uow.conditionDetail.bulkCreate(detailRecords);
        } else if (!conditionSetId && conditions.length === 0) {
             const newSet = await uow.conditionSet.create({
                 name: `Set for ${couponData.code} (No Conditions)`,
                 is_reusable: true,
             });
             conditionSetId = newSet.id;
        }

        const newCoupon = await uow.coupon.create({
            ...couponData,
            condition_set_id: conditionSetId
        });

        return newCoupon;
    }

    /**
     * Kiểm tra và áp dụng Coupon vào giỏ hàng.
     */
    async applyCoupon(uow: UnitOfWork, code: string, cartInfo: CartValidationInfo): Promise<{ discountAmount: number, coupon: Coupon }> {
        const now = new Date();
        
        const coupon = await uow.coupon.findActiveCouponByCode(code); 
        if (!coupon || !coupon.conditionSet) {
             throw new Error("Coupon is invalid, expired, or not active.");
        }
        
        if (coupon.used_count >= coupon.usage_limit) {
             throw new Error("Coupon has reached its usage limit.");
        }

        const details = coupon.conditionSet.details || []; 
        
        for (const detail of details) {
            const type = detail.condition_type as CouponConditionType;
            const value = detail.condition_value;
            
            switch (type) {
                case 'MIN_ORDER_VALUE':
                    if (cartInfo.subtotal < parseFloat(value)) {
                         throw new Error(`Minimum order value of ${value} is required.`);
                    }
                    break;
                case 'TIER':
                    if (value !== cartInfo.userMembershipId) {
                        throw new Error(`This coupon is only for ${value} members.`);
                    }
                    break;
                case 'NEW_USER':
                    if (value === 'true' && !cartInfo.isNewUser) {
                         throw new Error(`This coupon is only for new users.`);
                    }
                    break;
                case 'DAY_OF_WEEK':
                    const currentDay = now.getDay(); 
                    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
                    const requiredDays = value.split(',').map(d => d.trim().toUpperCase());
                    
                    if (!requiredDays.includes(dayNames[currentDay])) {
                         throw new Error(`Coupon is only valid on: ${value}.`);
                    }
                    break;
                case 'HOUR_OF_DAY':
                    const [startTimeStr, endTimeStr] = value.split('-');
                    const currentMinutes = now.getHours() * 60 + now.getMinutes();
                    
                    const startMinutes = parseInt(startTimeStr.split(':')[0]) * 60 + parseInt(startTimeStr.split(':')[1] || '0');
                    const endMinutes = parseInt(endTimeStr.split(':')[0]) * 60 + parseInt(endTimeStr.split(':')[1] || '0');
                    
                    if (currentMinutes < startMinutes || currentMinutes >= endMinutes) {
                         throw new Error(`Coupon is only valid between ${startTimeStr} and ${endTimeStr}.`);
                    }
                    break;
            }
        }
        
        let discount = 0;
        if (coupon.type === 'PERCENT') {
            discount = cartInfo.subtotal * (coupon.value / 100);
            if (coupon.max_discount && discount > coupon.max_discount) {
                discount = coupon.max_discount;
            }
        } else if (coupon.type === 'FIXED') {
            discount = coupon.value;
        }

        // Tăng số lần sử dụng của coupon
        const incrementSuccess = await uow.coupon.incrementUsedCount(coupon.id);
        
        if (!incrementSuccess) {
            throw new Error("Failed to update coupon usage count.");
        }

        return { discountAmount: discount, coupon };
    }
}