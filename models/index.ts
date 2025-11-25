import { sequelize } from "../config/connection";
import { User } from "./user.model";
import { UserAddress } from "./userAddress.model";
import { Product } from "./product.model";
import { ProductVariant } from "./productVariant.model";
import { Coupon } from "./coupon.model";
import { MembershipTier } from "./memberShipTier.model";
import { Favorite } from "./favorite.model";
import { ConditionSet } from "./conditionSets.model";
import { ConditionDetail } from "./conditionDetail.model";
import { Cart } from "./cart.model";
import { CartItem } from "./cartItem.model";
import { Order } from "./order.model";
import { OrderItem } from "./orderItem.model";
import { Payment } from "./payment.model";

// ====================== Associations ======================

// --- 1. User <-> UserAddress ---
User.hasMany(UserAddress, {
    as: "addresses",
    foreignKey: "user_id",
    onDelete: "CASCADE"
});
UserAddress.belongsTo(User, {
    as: "user",
    foreignKey: "user_id"
});

// --- 2. Product <-> ProductVariant ---
Product.hasMany(ProductVariant, {
    as: "variants",
    foreignKey: "product_id"
});
ProductVariant.belongsTo(Product, {
    as: "product",
    foreignKey: "product_id"
});

// --- 3. Coupon <-> ConditionSet ---
Coupon.belongsTo(ConditionSet, {
    as: "conditionSet",
    foreignKey: "condition_set_id",
    onDelete: "RESTRICT"
});
ConditionSet.hasMany(Coupon, {
    as: "coupons",
    foreignKey: "condition_set_id"
});

// --- 4. ConditionSet <-> ConditionDetail ---
ConditionSet.hasMany(ConditionDetail, {
    as: "details",
    foreignKey: "condition_set_id",
    onDelete: "CASCADE"
});
ConditionDetail.belongsTo(ConditionSet, {
    as: "conditionSet",
    foreignKey: "condition_set_id"
});

// --- 5. MembershipTier <-> User ---
MembershipTier.hasMany(User, {
    as: "users",
    foreignKey: {
        name: "membership_id",
        allowNull: false
    },
    constraints: true,
    onDelete: "RESTRICT",
    onUpdate: "CASCADE"
});

User.belongsTo(MembershipTier, {
    as: "membership",
    foreignKey: {
        name: "membership_id",
        allowNull: false
    },
    constraints: true,
    onDelete: "RESTRICT",
    onUpdate: "CASCADE"
});

// --- 6. User <-> Favorite ---
User.hasMany(Favorite, {
    as: "favorites",
    foreignKey: "user_id",
    onDelete: "CASCADE"
});
Favorite.belongsTo(User, {
    as: "user",
    foreignKey: "user_id"
});

// --- 7. Product <-> Favorite ---
Product.hasMany(Favorite, {
    as: "favorites",
    foreignKey: "product_id",
    onDelete: "CASCADE"
});
Favorite.belongsTo(Product, {
    as: "product",
    foreignKey: "product_id"
});

// ====================== CART ASSOCIATIONS ======================

// --- 8. User <-> Cart (1:N) ---
User.hasMany(Cart, {
    as: "carts",
    foreignKey: "user_id",
    onDelete: "CASCADE"
});
Cart.belongsTo(User, {
    as: "user",
    foreignKey: "user_id"
});

// --- 9. Cart <-> CartItem (1:N) ---
Cart.hasMany(CartItem, {
    as: "items",
    foreignKey: "cart_id",
    onDelete: "CASCADE"
});
CartItem.belongsTo(Cart, {
    as: "cart",
    foreignKey: "cart_id"
});

// --- 10. ProductVariant <-> CartItem (1:N) ---
ProductVariant.hasMany(CartItem, {
    as: "cartItems",
    foreignKey: "variant_id",
    onDelete: "RESTRICT"
});
CartItem.belongsTo(ProductVariant, {
    as: "variant",
    foreignKey: "variant_id"
});

// ====================== ORDER ASSOCIATIONS ======================

// --- 11. User <-> Order (1:N) ---
User.hasMany(Order, {
    as: "orders",
    foreignKey: "user_id",
    onDelete: "CASCADE"
});
Order.belongsTo(User, {
    as: "user",
    foreignKey: "user_id"
});

// --- 12. Cart <-> Order (1:1) ---
Cart.hasOne(Order, {
    as: "order",
    foreignKey: "cart_id",
    onDelete: "SET NULL"
});
Order.belongsTo(Cart, {
    as: "cart",
    foreignKey: "cart_id"
});

// --- 13. Order <-> OrderItem (1:N) ---
Order.hasMany(OrderItem, {
    as: "orderItems",
    foreignKey: "order_id",
    onDelete: "CASCADE"
});
OrderItem.belongsTo(Order, {
    as: "order",
    foreignKey: "order_id"
});

// --- 14. ProductVariant <-> OrderItem (1:N) ---
ProductVariant.hasMany(OrderItem, {
    as: "orderItems",
    foreignKey: "variant_id",
    onDelete: "RESTRICT"
});
OrderItem.belongsTo(ProductVariant, {
    as: "variant",
    foreignKey: "variant_id"
});

// ====================== PAYMENT ASSOCIATIONS (1:1) ======================

// --- 15. Order <-> Payment (1:1) ---
// 🔄 THAY ĐỔI: Một Order chỉ có một Payment duy nhất
Order.hasOne(Payment, {
    as: "payment",  // ⚠️ Đổi từ "payments" sang "payment" (số ít)
    foreignKey: "order_id",
    onDelete: "CASCADE" // Nếu Order bị xóa, Payment cũng bị xóa
});

Payment.belongsTo(Order, {
    as: "order",
    foreignKey: "order_id"
});

// ====================== Export Models ======================
export {
    sequelize,
    User,
    UserAddress,
    Product,
    ProductVariant,
    Coupon,
    MembershipTier,
    Favorite,
    ConditionSet,
    ConditionDetail,
    Cart,
    CartItem,
    Order,
    OrderItem,
    Payment
};