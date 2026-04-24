"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponRepository = void 0;
const sequelize_1 = require("sequelize");
const baseRepository_1 = require("./baseRepository");
const coupon_model_1 = require("../models/coupon.model");
const conditionSets_model_1 = require("../models/conditionSets.model");
const conditionDetail_model_1 = require("../models/conditionDetail.model");
class CouponRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(...arguments);
        this.model = coupon_model_1.Coupon;
    }
    /**
     * Compute coupon validity
     */
    computeIsValid(coupon) {
        const now = new Date();
        if (coupon.start_time && coupon.start_time > now)
            return false;
        if (coupon.end_time && coupon.end_time < now)
            return false;
        if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
            return false;
        }
        return true;
    }
    /**
     * Find coupon by code + is_valid
     */
    async findActiveCouponByCode(code) {
        const coupon = await super.findOne({
            where: {
                code,
                is_deleted: false
            },
            include: [{
                    model: conditionSets_model_1.ConditionSet,
                    as: 'conditionSet',
                    required: false,
                    include: [{
                            model: conditionDetail_model_1.ConditionDetail,
                            as: 'details',
                            where: { is_deleted: false },
                            required: false
                        }]
                }]
        });
        if (!coupon)
            return null;
        return {
            ...(coupon.toJSON()),
            is_valid: this.computeIsValid(coupon)
        };
    }
    /**
     * Find active coupons + is_valid
     */
    async findActiveCoupons(options) {
        const now = new Date();
        const coupons = await super.findAll({
            where: {
                start_time: { [sequelize_1.Op.lte]: now },
                end_time: { [sequelize_1.Op.gte]: now },
                is_deleted: false,
                ...(options?.where || {})
            },
            include: [{
                    model: conditionSets_model_1.ConditionSet,
                    as: 'conditionSet',
                    required: false,
                    include: [{
                            model: conditionDetail_model_1.ConditionDetail,
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
    async findAllWithValidity(options) {
        const coupons = await super.findAll(options);
        return coupons.map(coupon => ({
            ...(coupon.toJSON()),
            is_valid: this.computeIsValid(coupon)
        }));
    }
    /**
     * Find and count coupon + is_valid
     */
    async findAndCountAllWithValidity(options) {
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
    async incrementUsedCount(couponId) {
        try {
            const result = await this.model.increment('used_count', {
                by: 1,
                where: {
                    id: couponId,
                    used_count: { [sequelize_1.Op.lt]: (0, sequelize_1.col)('usage_limit') }
                },
                ...this.getTransactionOption()
            });
            const affectedRows = result?.[0]?.[1] || result?.[1] || 0;
            return affectedRows > 0;
        }
        catch (error) {
            console.error("Error incrementing used count:", error);
            return false;
        }
    }
}
exports.CouponRepository = CouponRepository;
//# sourceMappingURL=coupon.repository.js.map