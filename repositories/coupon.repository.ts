// repositories/coupon.repository.ts
import { Op, FindOptions } from "sequelize";
import { BaseRepository } from "./baseRepository";
import { Coupon } from "../models/coupon.model"; 
import { ConditionSet } from "../models/conditionSets.model"; // Đã sửa import path
import { ConditionDetail } from "../models/conditionDetail.model"; // Đã sửa import path

export class CouponRepository extends BaseRepository<Coupon> {
    protected model = Coupon; 

    /**
     * Tìm coupon theo mã code và kiểm tra trạng thái hoạt động/hết hạn.
     * Đồng thời, lấy tất cả ConditionDetails thông qua ConditionSet.
     */
    async findActiveCouponByCode(code: string): Promise<Coupon | null> {
        const now = new Date();
        
        return this.findOne({
            where: {
                code,
                is_deleted: false,
                start_time: { [Op.lte]: now }, 
                end_time: { [Op.gte]: now }, 
            },
            include: [{
                model: ConditionSet, 
                as: 'conditionSet', 
                required: true,
                include: [{
                    model: ConditionDetail,
                    as: 'details', 
                    where: { is_deleted: false },
                    required: false // LEFT JOIN, vì coupon vẫn hợp lệ nếu không có detail nào
                }]
            }],
        });
    }

    /**
     * Lấy tất cả coupon đang hoạt động, có thể áp dụng các tùy chọn tìm kiếm khác.
     */
    async findActiveCoupons(options?: FindOptions<Coupon>): Promise<Coupon[]> {
        const now = new Date();
        
        return this.findAll({
            where: {
                start_time: { [Op.lte]: now }, 
                end_time: { [Op.gte]: now }, 
                is_deleted: false,
                ...(options?.where || {}) 
            },
            ...options
        });
    }

    /**
     * Tăng số lần sử dụng của coupon một cách nguyên tử (atomic).
     */
    async incrementUsedCount(couponId: string): Promise<boolean> {
        if (!this.model) {
            return false;
        }

        try {
            await this.model.increment(
                'used_count',
                {
                    by: 1,
                    where: { id: couponId },
                    ...this.getTransactionOption() 
                }
            );
            return true;
        } catch (error) {
            console.error("Error incrementing used count:", error);
            return false;
        }
    }
}