// repositories/cartCoupon.repository.ts
import { FindOptions } from "sequelize";
import { BaseRepository } from "./baseRepository";
import { CartCoupon, CartCouponCreationAttributes } from "../models/cartCoupon.model";
import { Cart } from "../models/cart.model";
import { Coupon } from "../models/coupon.model";

export class CartCouponRepository extends BaseRepository<CartCoupon> {
    protected model = CartCoupon;

    /**
     * Tìm tất cả coupon đang được áp dụng cho một cart
     */
    async findByCartId(cartId: string, options?: Omit<FindOptions, 'transaction'>): Promise<CartCoupon[]> {
        return this.model.findAll({
            where: { cart_id: cartId },
            include: [
                {
                    model: Coupon,
                    as: "coupon"
                }
            ],
            ...options,
            ...this.getTransactionOption()
        });
    }

    /**
     * Tìm tất cả cart đang dùng một coupon cụ thể
     */
    async findByCouponId(couponId: string, options?: Omit<FindOptions, 'transaction'>): Promise<CartCoupon[]> {
        return this.model.findAll({
            where: { coupon_id: couponId },
            include: [
                {
                    model: Cart,
                    as: "cart"
                }
            ],
            ...options,
            ...this.getTransactionOption()
        });
    }

    /**
     * Kiểm tra một coupon đã được áp dụng vào cart chưa
     */
    async findByCartAndCoupon(cartId: string, couponId: string): Promise<CartCoupon | null> {
        return this.model.findOne({
            where: {
                cart_id: cartId,
                coupon_id: couponId
            },
            ...this.getTransactionOption()
        });
    }

    /**
     * Áp dụng coupon vào cart
     */
    async applyCoupon(cartId: string, couponId: string): Promise<CartCoupon> {
        return this.model.create(
            {
                cart_id: cartId,
                coupon_id: couponId
            } as CartCouponCreationAttributes,
            {
                ...this.getTransactionOption()
            }
        );
    }

    /**
     * Xóa một coupon khỏi cart
     */
    async removeCoupon(cartId: string, couponId: string): Promise<number> {
        return this.model.destroy({
            where: {
                cart_id: cartId,
                coupon_id: couponId
            },
            ...this.getTransactionOption()
        });
    }

    /**
     * Xóa toàn bộ coupon của một cart (dùng khi clear cart hoặc checkout)
     */
    async removeAllByCartId(cartId: string): Promise<number> {
        return this.model.destroy({
            where: { cart_id: cartId },
            ...this.getTransactionOption()
        });
    }
}