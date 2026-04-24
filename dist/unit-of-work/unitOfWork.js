"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitOfWork = void 0;
const connection_1 = require("../config/connection");
const user_repository_1 = require("../repositories/user.repository");
const userAddress_repository_1 = require("../repositories/userAddress.repository");
const product_repository_1 = require("../repositories/product.repository");
const productVariant_repository_1 = require("../repositories/productVariant.repository");
const favorite_repository_1 = require("../repositories/favorite.repository");
const coupon_repository_1 = require("../repositories/coupon.repository");
const membershipTier_repository_1 = require("../repositories/membershipTier.repository");
// ➡️ THÊM IMPORTS CHO CART VÀ CARTITEM REPOSITORIES
const cart_repository_1 = require("../repositories/cart.repository");
const cartItem_repository_1 = require("../repositories/cartItem.repository");
const conditionSet_repository_1 = require("../repositories/conditionSet.repository");
const conditionDetail_repository_1 = require("../repositories/conditionDetail.repository");
const order_repository_1 = require("../repositories/order.repository");
const orderItem_repositpry_1 = require("../repositories/orderItem.repositpry");
const payment_repository_1 = require("../repositories/payment.repository");
const cartCoupon_repository_1 = require("../repositories/cartCoupon.repository");
class UnitOfWork {
    constructor() {
        this.transaction = null;
        this.users = new user_repository_1.UserRepository();
        this.userAddresses = new userAddress_repository_1.UserAddressRepository();
        this.products = new product_repository_1.ProductRepository();
        this.productVariants = new productVariant_repository_1.ProductVariantRepository();
        this.favorite = new favorite_repository_1.FavoriteRepository();
        this.coupon = new coupon_repository_1.CouponRepository();
        this.membershipTier = new membershipTier_repository_1.MembershipTierRepository();
        // ➡️ KHỞI TẠO REPOSITORIES MỚI
        this.conditionSet = new conditionSet_repository_1.ConditionSetRepository();
        this.conditionDetail = new conditionDetail_repository_1.ConditionDetailRepository();
        // ➡️ KHỞI TẠO CART VÀ CARTITEM
        this.cart = new cart_repository_1.CartRepository();
        this.cartItem = new cartItem_repository_1.CartItemRepository();
        this.order = new order_repository_1.OrderRepository();
        this.orderItem = new orderItem_repositpry_1.OrderItemRepository();
        this.payment = new payment_repository_1.PaymentRepository();
        this.cartCoupon = new cartCoupon_repository_1.CartCouponRepository();
    }
    /**
     * Bắt đầu transaction mới
     */
    async start() {
        this.transaction = await connection_1.sequelize.transaction();
        // Set transaction cho tất cả repositories
        this.users.setTransaction(this.transaction);
        this.userAddresses.setTransaction(this.transaction);
        this.products.setTransaction(this.transaction);
        this.productVariants.setTransaction(this.transaction);
        this.favorite.setTransaction(this.transaction);
        this.coupon.setTransaction(this.transaction);
        this.membershipTier.setTransaction(this.transaction);
        // ➡️ SET TRANSACTION MỚI
        this.conditionSet.setTransaction(this.transaction);
        this.conditionDetail.setTransaction(this.transaction);
        // ➡️ SET TRANSACTION CHO CART VÀ CARTITEM
        this.cart.setTransaction(this.transaction);
        this.cartItem.setTransaction(this.transaction);
        this.order.setTransaction(this.transaction);
        this.orderItem.setTransaction(this.transaction);
        this.payment.setTransaction(this.transaction);
        this.cartCoupon.setTransaction(this.transaction);
    }
    /**
     * Commit transaction
     */
    async commit() {
        if (this.transaction) {
            await this.transaction.commit();
            this.transaction = null;
        }
    }
    /**
     * Rollback transaction
     */
    async rollback() {
        if (this.transaction) {
            await this.transaction.rollback();
            this.transaction = null;
        }
    }
    /**
     * Kiểm tra xem có transaction đang chạy không
     */
    isTransactionActive() {
        return this.transaction !== null;
    }
}
exports.UnitOfWork = UnitOfWork;
//# sourceMappingURL=unitOfWork.js.map