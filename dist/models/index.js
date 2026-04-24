"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = exports.OrderItem = exports.Order = exports.CartCoupon = exports.CartItem = exports.Cart = exports.ConditionDetail = exports.ConditionSet = exports.Favorite = exports.MembershipTier = exports.Coupon = exports.ProductVariant = exports.Product = exports.UserAddress = exports.User = exports.sequelize = void 0;
// models/index.ts
const connection_1 = require("../config/connection");
Object.defineProperty(exports, "sequelize", { enumerable: true, get: function () { return connection_1.sequelize; } });
const user_model_1 = require("./user.model");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return user_model_1.User; } });
const userAddress_model_1 = require("./userAddress.model");
Object.defineProperty(exports, "UserAddress", { enumerable: true, get: function () { return userAddress_model_1.UserAddress; } });
const product_model_1 = require("./product.model");
Object.defineProperty(exports, "Product", { enumerable: true, get: function () { return product_model_1.Product; } });
const productVariant_model_1 = require("./productVariant.model");
Object.defineProperty(exports, "ProductVariant", { enumerable: true, get: function () { return productVariant_model_1.ProductVariant; } });
const coupon_model_1 = require("./coupon.model");
Object.defineProperty(exports, "Coupon", { enumerable: true, get: function () { return coupon_model_1.Coupon; } });
const memberShipTier_model_1 = require("./memberShipTier.model");
Object.defineProperty(exports, "MembershipTier", { enumerable: true, get: function () { return memberShipTier_model_1.MembershipTier; } });
const favorite_model_1 = require("./favorite.model");
Object.defineProperty(exports, "Favorite", { enumerable: true, get: function () { return favorite_model_1.Favorite; } });
const conditionSets_model_1 = require("./conditionSets.model");
Object.defineProperty(exports, "ConditionSet", { enumerable: true, get: function () { return conditionSets_model_1.ConditionSet; } });
const conditionDetail_model_1 = require("./conditionDetail.model");
Object.defineProperty(exports, "ConditionDetail", { enumerable: true, get: function () { return conditionDetail_model_1.ConditionDetail; } });
const cart_model_1 = require("./cart.model");
Object.defineProperty(exports, "Cart", { enumerable: true, get: function () { return cart_model_1.Cart; } });
const cartItem_model_1 = require("./cartItem.model");
Object.defineProperty(exports, "CartItem", { enumerable: true, get: function () { return cartItem_model_1.CartItem; } });
const cartCoupon_model_1 = require("./cartCoupon.model"); // ✅ thêm
Object.defineProperty(exports, "CartCoupon", { enumerable: true, get: function () { return cartCoupon_model_1.CartCoupon; } });
const order_model_1 = require("./order.model");
Object.defineProperty(exports, "Order", { enumerable: true, get: function () { return order_model_1.Order; } });
const orderItem_model_1 = require("./orderItem.model");
Object.defineProperty(exports, "OrderItem", { enumerable: true, get: function () { return orderItem_model_1.OrderItem; } });
const payment_model_1 = require("./payment.model");
Object.defineProperty(exports, "Payment", { enumerable: true, get: function () { return payment_model_1.Payment; } });
// ====================== Associations ======================
// --- 1. User <-> UserAddress ---
user_model_1.User.hasMany(userAddress_model_1.UserAddress, { as: "addresses", foreignKey: "user_id", onDelete: "CASCADE" });
userAddress_model_1.UserAddress.belongsTo(user_model_1.User, { as: "user", foreignKey: "user_id" });
// --- 2. Product <-> ProductVariant ---
product_model_1.Product.hasMany(productVariant_model_1.ProductVariant, { as: "variants", foreignKey: "product_id" });
productVariant_model_1.ProductVariant.belongsTo(product_model_1.Product, { as: "product", foreignKey: "product_id" });
// --- 3. Coupon <-> ConditionSet ---
coupon_model_1.Coupon.belongsTo(conditionSets_model_1.ConditionSet, { as: "conditionSet", foreignKey: "condition_set_id", onDelete: "RESTRICT" });
conditionSets_model_1.ConditionSet.hasMany(coupon_model_1.Coupon, { as: "coupons", foreignKey: "condition_set_id" });
// --- 4. ConditionSet <-> ConditionDetail ---
conditionSets_model_1.ConditionSet.hasMany(conditionDetail_model_1.ConditionDetail, { as: "details", foreignKey: "condition_set_id", onDelete: "CASCADE" });
conditionDetail_model_1.ConditionDetail.belongsTo(conditionSets_model_1.ConditionSet, { as: "conditionSet", foreignKey: "condition_set_id" });
// --- 5. MembershipTier <-> User ---
memberShipTier_model_1.MembershipTier.hasMany(user_model_1.User, {
    as: "users",
    foreignKey: { name: "membership_id", allowNull: false },
    constraints: true, onDelete: "RESTRICT", onUpdate: "CASCADE"
});
user_model_1.User.belongsTo(memberShipTier_model_1.MembershipTier, {
    as: "membership",
    foreignKey: { name: "membership_id", allowNull: false },
    constraints: true, onDelete: "RESTRICT", onUpdate: "CASCADE"
});
// --- 6. User <-> Favorite ---
user_model_1.User.hasMany(favorite_model_1.Favorite, { as: "favorites", foreignKey: "user_id", onDelete: "CASCADE" });
favorite_model_1.Favorite.belongsTo(user_model_1.User, { as: "user", foreignKey: "user_id" });
// --- 7. Product <-> Favorite ---
product_model_1.Product.hasMany(favorite_model_1.Favorite, { as: "favorites", foreignKey: "product_id", onDelete: "CASCADE" });
favorite_model_1.Favorite.belongsTo(product_model_1.Product, { as: "product", foreignKey: "product_id" });
// ====================== CART ASSOCIATIONS ======================
// --- 8. User <-> Cart (1:N) ---
user_model_1.User.hasMany(cart_model_1.Cart, { as: "carts", foreignKey: "user_id", onDelete: "CASCADE" });
cart_model_1.Cart.belongsTo(user_model_1.User, { as: "user", foreignKey: "user_id" });
// --- 9. Cart <-> CartItem (1:N) ---
cart_model_1.Cart.hasMany(cartItem_model_1.CartItem, { as: "items", foreignKey: "cart_id", onDelete: "CASCADE" });
cartItem_model_1.CartItem.belongsTo(cart_model_1.Cart, { as: "cart", foreignKey: "cart_id" });
// --- 10. ProductVariant <-> CartItem (1:N) ---
productVariant_model_1.ProductVariant.hasMany(cartItem_model_1.CartItem, { as: "cartItems", foreignKey: "variant_id", onDelete: "RESTRICT" });
cartItem_model_1.CartItem.belongsTo(productVariant_model_1.ProductVariant, { as: "variant", foreignKey: "variant_id" });
// ====================== CART COUPON ASSOCIATIONS ======================
// --- 11. Cart <-> Coupon (M:N through CartCoupon) ---
cart_model_1.Cart.belongsToMany(coupon_model_1.Coupon, {
    through: cartCoupon_model_1.CartCoupon,
    as: "coupons",
    foreignKey: "cart_id",
    otherKey: "coupon_id"
});
coupon_model_1.Coupon.belongsToMany(cart_model_1.Cart, {
    through: cartCoupon_model_1.CartCoupon,
    as: "carts",
    foreignKey: "coupon_id",
    otherKey: "cart_id"
});
// Direct associations cho CartCoupon (dùng khi query trực tiếp bảng junction)
cartCoupon_model_1.CartCoupon.belongsTo(cart_model_1.Cart, { as: "cart", foreignKey: "cart_id" });
cartCoupon_model_1.CartCoupon.belongsTo(coupon_model_1.Coupon, { as: "coupon", foreignKey: "coupon_id" });
cart_model_1.Cart.hasMany(cartCoupon_model_1.CartCoupon, { as: "cartCoupons", foreignKey: "cart_id", onDelete: "CASCADE" });
coupon_model_1.Coupon.hasMany(cartCoupon_model_1.CartCoupon, { as: "cartCoupons", foreignKey: "coupon_id", onDelete: "CASCADE" });
// ====================== ORDER ASSOCIATIONS ======================
// --- 12. User <-> Order (1:N) ---
user_model_1.User.hasMany(order_model_1.Order, { as: "orders", foreignKey: "user_id", onDelete: "CASCADE" });
order_model_1.Order.belongsTo(user_model_1.User, { as: "user", foreignKey: "user_id" });
// --- 13. Cart <-> Order (1:1) ---
cart_model_1.Cart.hasOne(order_model_1.Order, { as: "order", foreignKey: "cart_id", onDelete: "SET NULL" });
order_model_1.Order.belongsTo(cart_model_1.Cart, { as: "cart", foreignKey: "cart_id" });
// --- 14. Order <-> OrderItem (1:N) ---
order_model_1.Order.hasMany(orderItem_model_1.OrderItem, { as: "orderItems", foreignKey: "order_id", onDelete: "CASCADE" });
orderItem_model_1.OrderItem.belongsTo(order_model_1.Order, { as: "order", foreignKey: "order_id" });
// --- 15. ProductVariant <-> OrderItem (1:N) ---
productVariant_model_1.ProductVariant.hasMany(orderItem_model_1.OrderItem, { as: "orderItems", foreignKey: "variant_id", onDelete: "RESTRICT" });
orderItem_model_1.OrderItem.belongsTo(productVariant_model_1.ProductVariant, { as: "variant", foreignKey: "variant_id" });
// ====================== PAYMENT ASSOCIATIONS (1:1) ======================
// --- 16. Order <-> Payment (1:1) ---
order_model_1.Order.hasOne(payment_model_1.Payment, { as: "payment", foreignKey: "order_id", onDelete: "CASCADE" });
payment_model_1.Payment.belongsTo(order_model_1.Order, { as: "order", foreignKey: "order_id" });
//# sourceMappingURL=index.js.map