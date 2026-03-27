import { UnitOfWork } from "../unit-of-work/unitOfWork";
import { Coupon, CouponCreationAttributes } from "../models/coupon.model";
import { ConditionSet } from "../models/conditionSets.model";
import { ConditionDetail } from "../models/conditionDetail.model";
import { Op } from "sequelize";
import { CouponWithValidity } from "../repositories/coupon.repository";

interface CouponInfo extends CouponWithValidity { }

export class CouponService {

    /**
     * Admin get all coupon
     */
    async getAllcoupon(uow: UnitOfWork, page: number, limit: number, search?: string) {

        const offset = (page - 1) * limit;

        let where: any = { is_deleted: false };

        if (search) {
            where.code = { [Op.iLike]: `%${search}%` };
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
    async getAllCouponByUserId(
        uow: UnitOfWork,
        userId: string,
        userMembershipId: string
    ): Promise<CouponInfo[]> {

        const activeCoupons = await uow.coupon.findActiveCoupons();

        const results: CouponInfo[] = [];

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
    async getCouponByCode(
        uow: UnitOfWork,
        code: string
    ): Promise<CouponWithValidity | null> {

        return uow.coupon.findActiveCouponByCode(code);
    }

    /**
     * create coupon
     */
    async createCoupon(
        uow: UnitOfWork,
        couponData: Partial<CouponCreationAttributes>,
        conditions: any[] = []
    ) {

        const existing = await uow.coupon.findOne({
            where: { code: couponData.code, is_deleted: false }
        });

        if (existing) throw new Error("Coupon code already exists.");

        let conditionSetId = couponData.condition_set_id;

        if (!conditionSetId) {

            const newSet = await uow.conditionSet.create({
                name: `Set for ${couponData.code}`,
                is_reusable: false
            });

            conditionSetId = newSet.id;

            if (conditions.length > 0) {

                await uow.conditionDetail.bulkCreate(
                    conditions.map(c => ({
                        ...c,
                        condition_set_id: newSet.id,
                        is_deleted: false
                    }))
                );
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
    async updateCoupon(
        uow: UnitOfWork,
        id: string,
        updateData: Partial<CouponCreationAttributes>,
        conditions?: any[]
    ) {

        const coupon = await uow.coupon.findById(id);

        if (!coupon) throw new Error("Coupon not found.");

        await uow.coupon.update(id, updateData);

        if (conditions && coupon.condition_set_id) {

            await uow.conditionDetail.updateByCondition(
                { condition_set_id: coupon.condition_set_id },
                { is_deleted: true }
            );

            await uow.conditionDetail.bulkCreate(
                conditions.map(c => ({
                    ...c,
                    condition_set_id: coupon.condition_set_id,
                    is_deleted: false
                }))
            );
        }

        return uow.coupon.findById(id);
    }

    /**
     * delete coupon
     */
    async deleteCoupon(uow: UnitOfWork, id: string) {
        return uow.coupon.softDelete(id);
    }

    /**
     * apply coupon
     */
    async applyCoupon(uow: UnitOfWork, code: string, userId: string) {

        const cart = await uow.cart.findActiveCartByUserId(userId);

        if (!cart) throw new Error("Cart not found.");

        const coupon = await uow.coupon.findActiveCouponByCode(code);

        if (!coupon) throw new Error("Coupon invalid.");

        if (!coupon.is_valid) throw new Error("Coupon is not valid.");

        const cartItems = (cart as any).items || [];
         console.log("cartItem", cartItems);

        const subtotal = cartItems.reduce((acc: number, item: any) => {

            const price = Number(item.total_price ?? 0);


            const quantity = Number(item.quantity ?? 0);

            if (isNaN(price) || isNaN(quantity)) {
                console.log("Invalid cart item:", item);
                return acc;
            }

            return acc + price * quantity;

        }, 0);
        console.log("sub",subtotal)
        if (subtotal === 0) throw new Error("Cart empty.");

        const success = await uow.coupon.incrementUsedCount(coupon.id);

        if (!success) throw new Error("Coupon usage limit reached.");

        let discountAmount = 0;

        if (coupon.type === 'PERCENT') {

            discountAmount = subtotal * (coupon.value / 100);


            if (coupon.max_discount && discountAmount > coupon.max_discount) {
                discountAmount = Number(coupon.max_discount);
            }

        } else if (coupon.type === 'FIXED') {

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