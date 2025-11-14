import { sequelize } from "../config/connection";

import { User } from "./user.model";
import { UserAddress } from "./userAddress.model";
import { Product } from "./product.model";
import { ProductVariant } from "./productVariant.model";
import { Coupon } from "./coupon.model";
import { CouponCondition } from "./couponCondition.model";
import { MembershipTier } from "./memberShipTier.model"; 
import { Favorite } from "./favorite.model"; 

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

// --- 3. Coupon <-> CouponCondition ---
Coupon.hasMany(CouponCondition, {
    as: "conditions",
    foreignKey: "coupon_id",
    onDelete: "CASCADE"
});

CouponCondition.belongsTo(Coupon, {
    as: "coupon",
    foreignKey: "coupon_id"
});

// --- 4. MembershipTier <-> User (Rank) ---
MembershipTier.hasMany(User, {
    as: "users",
    foreignKey: "membership_id" // ⬅️ ĐÃ CẬP NHẬT FOREIGN KEY
});

User.belongsTo(MembershipTier, {
    as: "membership",
    foreignKey: "membership_id" // ⬅️ ĐÃ CẬP NHẬT FOREIGN KEY
});

// --- 5. User <-> Favorite ---
User.hasMany(Favorite, {
    as: "favorites",
    foreignKey: "user_id",
    onDelete: "CASCADE"
});

Favorite.belongsTo(User, {
    as: "user",
    foreignKey: "user_id"
});

// --- 6. Product <-> Favorite ---
Product.hasMany(Favorite, {
    as: "favorites",
    foreignKey: "product_id",
    onDelete: "CASCADE"
});

Favorite.belongsTo(Product, {
    as: "product",
    foreignKey: "product_id"
});

// ====================== Export Models ======================

export {
    sequelize,
    User,
    UserAddress,
    Product,
    ProductVariant,
    Coupon,
    CouponCondition,
    MembershipTier, 
    Favorite
};