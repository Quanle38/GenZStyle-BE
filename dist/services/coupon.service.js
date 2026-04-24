"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponService = void 0;
const sequelize_1 = require("sequelize");
class CouponService {
    /**
     * Admin get all coupon
     */
    async getAllcoupon(uow, page, limit, search) {
        const offset = (page - 1) * limit;
        let where = { is_deleted: false };
        if (search) {
            where.code = { [sequelize_1.Op.iLike]: `%${search}%` };
        }
        return uow.coupon.findAndCountAllWithValidity({
            where,
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });
    }
    /**
     * User get coupons
     */
    async getAllCouponByUserId(uow, userId, userMembershipId) {
        const activeCoupons = await uow.coupon.findActiveCoupons();
        const results = [];
        for (const coupon of activeCoupons) {
            let isValid = coupon.is_valid;
            const details = coupon.conditionSet?.details || [];
            for (const detail of details) {
                if (detail.condition_type === 'TIER') {
                    if (detail.condition_value !== userMembershipId) {
                        isValid = false;
                    }
                }
                if (detail.condition_type === 'NEW_USER') {
                    if (detail.condition_value === 'true') {
                        const isNewUser = await uow.users.isNewUser(userId);
                        if (!isNewUser) {
                            isValid = false;
                        }
                    }
                }
            }
            results.push({
                ...coupon,
                is_valid: isValid
            });
        }
        return results;
    }
    /**
     * get coupon by code
     */
    async getCouponByCode(uow, code) {
        return uow.coupon.findActiveCouponByCode(code);
    }
    /**
     * create coupon
     */
    async createCoupon(uow, couponData, conditions = []) {
        const existing = await uow.coupon.findOne({
            where: { code: couponData.code, is_deleted: false }
        });
        if (existing)
            throw new Error("Coupon code already exists.");
        let conditionSetId = couponData.condition_set_id;
        if (!conditionSetId) {
            const newSet = await uow.conditionSet.create({
                name: `Set for ${couponData.code}`,
                is_reusable: false
            });
            conditionSetId = newSet.id;
            if (conditions.length > 0) {
                await uow.conditionDetail.bulkCreate(conditions.map(c => ({
                    ...c,
                    condition_set_id: newSet.id,
                    is_deleted: false
                })));
            }
        }
        return uow.coupon.create({
            ...couponData,
            condition_set_id: conditionSetId
        });
    }
    /**
     * update coupon
     */
    async updateCoupon(uow, id, updateData, conditions) {
        const coupon = await uow.coupon.findById(id);
        if (!coupon)
            throw new Error("Coupon not found.");
        await uow.coupon.update(id, updateData);
        if (conditions && coupon.condition_set_id) {
            await uow.conditionDetail.updateByCondition({ condition_set_id: coupon.condition_set_id }, { is_deleted: true });
            await uow.conditionDetail.bulkCreate(conditions.map(c => ({
                ...c,
                condition_set_id: coupon.condition_set_id,
                is_deleted: false
            })));
        }
        return uow.coupon.findById(id);
    }
    /**
     * delete coupon
     */
    async deleteCoupon(uow, id) {
        return uow.coupon.softDelete(id);
    }
    /**
     * apply coupon
     */
    async applyCoupon(uow, code, userId) {
        const cart = await uow.cart.findActiveCartByUserId(userId);
        if (!cart)
            throw new Error("Cart not found.");
        const coupon = await uow.coupon.findActiveCouponByCode(code);
        if (!coupon)
            throw new Error("Coupon invalid.");
        if (!coupon.is_valid)
            throw new Error("Coupon is not valid.");
        const cartItems = cart.items || [];
        console.log("cartItem", cartItems);
        const subtotal = cartItems.reduce((acc, item) => {
            const price = Number(item.total_price ?? 0);
            const quantity = Number(item.quantity ?? 0);
            if (isNaN(price) || isNaN(quantity)) {
                console.log("Invalid cart item:", item);
                return acc;
            }
            return acc + price * quantity;
        }, 0);
        console.log("sub", subtotal);
        if (subtotal === 0)
            throw new Error("Cart empty.");
        const success = await uow.coupon.incrementUsedCount(coupon.id);
        if (!success)
            throw new Error("Coupon usage limit reached.");
        let discountAmount = 0;
        if (coupon.type === 'PERCENT') {
            discountAmount = subtotal * (coupon.value / 100);
            if (coupon.max_discount && discountAmount > coupon.max_discount) {
                discountAmount = Number(coupon.max_discount);
            }
        }
        else if (coupon.type === 'FIXED') {
            discountAmount = Number(coupon.value);
        }
        discountAmount = Math.min(discountAmount || 0, subtotal || 0);
        return {
            couponCode: coupon.code,
            subtotal,
            discountAmount,
            finalAmount: subtotal - discountAmount
        };
    }
}
exports.CouponService = CouponService;
//# sourceMappingURL=coupon.service.js.map