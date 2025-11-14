// repositories/couponCondition.repository.ts
import { BaseRepository } from "./baseRepository";
import { CouponCondition } from "../models/couponCondition.model"; 
import { Op } from "sequelize";

export class CouponConditionRepository extends BaseRepository<CouponCondition> {
    protected model = CouponCondition as any;

    /**
     * Lấy tất cả điều kiện (chưa bị xóa) của một coupon.
     */
    async findByCouponId(couponId: string): Promise<CouponCondition[]> {
        return this.findAll({
            where: {
                coupon_id: couponId,
                is_deleted: false
            }
        });
    }

    /**
     * Xóa mềm (soft delete) tất cả các điều kiện của một coupon.
     */
    async softDeleteByCouponId(couponId: string): Promise<number> {
        const [affectedCount] = await this.updateByCondition(
            { coupon_id: couponId, is_deleted: false },
            { is_deleted: true }
        );
        return affectedCount;
    }
}