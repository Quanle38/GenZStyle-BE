import { sequelize } from "../config/connection";

import { User } from "./user.model";
import { UserAddress } from "./userAddress.model";
import { Product } from "./product.model";
import { ProductVariant } from "./productVariant.model";

// ====================== Associations ======================

// User <-> UserAddress
User.hasMany(UserAddress, {
    as: "addresses",
    foreignKey: "user_id",
    onDelete: "CASCADE"
});

UserAddress.belongsTo(User, {
    as: "user",
    foreignKey: "user_id"
});

// Product <-> ProductVariant
Product.hasMany(ProductVariant, {
    as: "variants",
    foreignKey: "product_id"
});

ProductVariant.belongsTo(Product, {
    as: "product",
    foreignKey: "product_id"
});

// ====================== Export Models ======================

export {
    sequelize,
    User,
    UserAddress,
    Product,
    ProductVariant
};
