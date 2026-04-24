"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartCouponRepository = void 0;
const baseRepository_1 = require("./baseRepository");
const cartCoupon_model_1 = require("../models/cartCoupon.model");
const cart_model_1 = require("../models/cart.model");
const coupon_model_1 = require("../models/coupon.model");
class CartCouponRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(...arguments);
        this.model = cartCoupon_model_1.CartCoupon;
    }
    /**
     * Tìm tất cả coupon đang được áp dụng cho một cart
     */
    async findByCartId(cartId, options) {
        return this.model.findAll({
            where: { cart_id: cartId },
            include: [
                {
                    model: coupon_model_1.Coupon,
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
    async findByCouponId(couponId, options) {
        return this.model.findAll({
            where: { coupon_id: couponId },
            include: [
                {
                    model: cart_model_1.Cart,
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
    async findByCartAndCoupon(cartId, couponId) {
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
    async applyCoupon(cartId, couponId) {
        return this.model.create({
            cart_id: cartId,
            coupon_id: couponId
        }, {
            ...this.getTransactionOption()
        });
    }
    /**
     * Xóa một coupon khỏi cart
     */
    async removeCoupon(cartId, couponId) {
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
    async removeAllByCartId(cartId) {
        return this.model.destroy({
            where: { cart_id: cartId },
            ...this.getTransactionOption()
        });
    }
}
exports.CartCouponRepository = CartCouponRepository;
//# sourceMappingURL=cartCoupon.repository.js.map