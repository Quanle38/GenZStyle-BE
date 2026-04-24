"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartCouponService = void 0;
class CartCouponService {
    /**
     * Áp dụng coupon vào cart theo coupon_code
     * Validate: tồn tại, còn hạn, chưa xóa, chưa vượt usage_limit, chưa apply vào cart này
     */
    async applyCoupon(uow, userId, couponCode) {
        // 1. Lấy cart của user
        const cart = await uow.cart.findOne({ where: { user_id: userId } });
        if (!cart)
            throw new Error("Cart not found.");
        // 2. Tìm coupon theo code
        const coupon = await uow.coupon.findOne({
            where: { code: couponCode, is_deleted: false }
        });
        if (!coupon)
            throw new Error("Coupon not found or has been deleted.");
        // 3. Kiểm tra thời hạn
        const now = new Date();
        if (now < coupon.start_time)
            throw new Error("Coupon is not yet active.");
        if (now > coupon.end_time)
            throw new Error("Coupon has expired.");
        // 4. Kiểm tra usage_limit
        if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
            throw new Error("Coupon has reached its usage limit.");
        }
        // 5. Kiểm tra coupon đã được apply vào cart này chưa
        const existing = await uow.cartCoupon.findByCartAndCoupon(cart.id, coupon.id);
        if (existing)
            throw new Error("Coupon already applied to this cart.");
        // 6. Apply
        return uow.cartCoupon.applyCoupon(cart.id, coupon.id);
    }
    /**
     * Xóa coupon khỏi cart
     */
    async removeCoupon(uow, userId, couponId) {
        const cart = await uow.cart.findOne({ where: { user_id: userId } });
        if (!cart)
            throw new Error("Cart not found.");
        const removed = await uow.cartCoupon.removeCoupon(cart.id, couponId);
        if (removed === 0)
            throw new Error("Coupon not found in cart.");
        return true;
    }
    /**
     * Lấy danh sách coupon đang apply trên cart
     */
    async getCouponsOfCart(uow, userId) {
        const cart = await uow.cart.findOne({ where: { user_id: userId } });
        if (!cart)
            throw new Error("Cart not found.");
        return uow.cartCoupon.findByCartId(cart.id);
    }
    /**
     * Tính tổng discount từ danh sách coupon áp dụng lên total_price
     * - PERCENT: giảm theo %, có max_discount nếu có
     * - FIXED: giảm cố định
     */
    calculateDiscount(totalPrice, coupons) {
        let discount_amount = 0;
        const coupon_details = [];
        for (const cc of coupons) {
            const c = cc.coupon;
            if (!c)
                continue;
            let discount = 0;
            if (c.type === "PERCENT") {
                discount = (totalPrice * Number(c.value)) / 100;
                if (c.max_discount !== null) {
                    discount = Math.min(discount, Number(c.max_discount));
                }
            }
            else if (c.type === "FIXED") {
                discount = Number(c.value);
            }
            discount_amount += discount;
            coupon_details.push({ code: c.code, type: c.type, discount });
        }
        // Không giảm quá total
        discount_amount = Math.min(discount_amount, totalPrice);
        return { discount_amount, coupon_details };
    }
}
exports.CartCouponService = CartCouponService;
//# sourceMappingURL=cartCoupon.service.js.map