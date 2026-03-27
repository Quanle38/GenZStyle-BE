import { Op, FindOptions, col } from "sequelize";
import { BaseRepository } from "./baseRepository";
import { Coupon, CouponAttributes } from "../models/coupon.model";
import { ConditionSet } from "../models/conditionSets.model";
import { ConditionDetail } from "../models/conditionDetail.model";

export type CouponWithValidity = CouponAttributes & {
    is_valid: boolean;
    conditionSet?: ConditionSet;
};


export class CouponRepository extends BaseRepository<Coupon> {
    protected model = Coupon;

    /**
     * Compute coupon validity
     */
    private computeIsValid(coupon: Coupon): boolean {

        const now = new Date();

        if (coupon.start_time && coupon.start_time > now) return false;
        if (coupon.end_time && coupon.end_time < now) return false;

        if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
            return false;
        }

        return true;
    }

    /**
     * Find coupon by code + is_valid
     */
    async findActiveCouponByCode(code: string): Promise<CouponWithValidity | null> {

        const coupon = await super.findOne({
            where: {
                code,
                is_deleted: false
            },
            include: [{
                model: ConditionSet,
                as: 'conditionSet',
                required: false,
                include: [{
                    model: ConditionDetail,
                    as: 'details',
                    where: { is_deleted: false },
                    required: false
                }]
            }]
        });

        if (!coupon) return null;

        return {
            ...(coupon.toJSON()),
            is_valid: this.computeIsValid(coupon)
        };
    }

    /**
     * Find active coupons + is_valid
     */
    async findActiveCoupons(options?: FindOptions<Coupon>): Promise<CouponWithValidity[]> {

        const now = new Date();

        const coupons = await super.findAll({
            where: {
                start_time: { [Op.lte]: now },
                end_time: { [Op.gte]: now },
                is_deleted: false,
                ...(options?.where || {})
            },
            include: [{
                model: ConditionSet,
                as: 'conditionSet',
                required: false,
                include: [{
                    model: ConditionDetail,
                    as: 'details',
                    where: { is_deleted: false },
                    required: false
                }]
            }],
            ...options
        });

        return coupons.map(coupon => ({
            ...(coupon.toJSON()),
            is_valid: this.computeIsValid(coupon)
        }));
    }

    /**
     * Find all coupon + is_valid
     */
    async findAllWithValidity(options?: Omit<FindOptions, 'transaction'>): Promise<CouponWithValidity[]> {

        const coupons = await super.findAll(options);

        return coupons.map(coupon => ({
            ...(coupon.toJSON()),
            is_valid: this.computeIsValid(coupon)
        }));
    }

    /**
     * Find and count coupon + is_valid
     */
    async findAndCountAllWithValidity(
        options?: Omit<FindOptions, 'transaction'>
    ): Promise<{ rows: CouponWithValidity[]; count: number }> {

        const result = await super.findAndCountAll(options);

        return {
            count: result.count,
            rows: result.rows.map(coupon => ({
                ...(coupon.toJSON()),
                is_valid: this.computeIsValid(coupon)
            }))
        };
    }

    /**
     * Atomic increment usage
     */
    async incrementUsedCount(couponId: string): Promise<boolean> {

        try {

            const result = await this.model.increment('used_count', {
                by: 1,
                where: {
                    id: couponId,
                    used_count: { [Op.lt]: col('usage_limit') }
                },
                ...this.getTransactionOption()
            }) as any;

            const affectedRows = result?.[0]?.[1] || result?.[1] || 0;

            return affectedRows > 0;

        } catch (error) {

            console.error("Error incrementing used count:", error);
            return false;
        }
    }
}