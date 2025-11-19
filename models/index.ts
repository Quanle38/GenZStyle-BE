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
// === NHẬP MODELS MỚI ===
import { Cart } from "./cart.model"; 
import { CartItem } from "./cartItem.model"; 

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

// ====================== MỚI: CART ASSOCIATIONS ======================

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
    onDelete: "RESTRICT" // Không nên xóa variant nếu còn trong giỏ hàng
});
CartItem.belongsTo(ProductVariant, {
    as: "variant",
    foreignKey: "variant_id"
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
    // === EXPORT MODELS MỚI ===
    Cart,
    CartItem
};