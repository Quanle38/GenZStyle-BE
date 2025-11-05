import { sequelize } from "../config/connection";
import { User } from "./user.model";
import { UserAddress } from "./userAddress.model";
import { Product } from "./product.model";
import { ProductVariant } from "./productVariant.model";
// Đặt sau khi cả hai model User và UserAddress đã được khởi tạo/import

// Quan hệ 1-Nhiều: Một User có nhiều UserAddress
User.hasMany(UserAddress, {
    foreignKey: 'user_id',
    as: 'addresses',        // Alias để truy vấn: user.getAddresses()
    onDelete: 'CASCADE',    // Tùy chọn: Xóa user sẽ xóa các address liên quan
});

// Quan hệ Ngược lại: UserAddress thuộc về một User
UserAddress.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user', // Alias để truy vấn: userAddress.getUser()
});
// Product <-> Variant associations
Product.hasMany(ProductVariant, {
    sourceKey: 'id',
    foreignKey: 'product_id',
    as: 'variants'
});

ProductVariant.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product'
});
export { Product, ProductVariant, sequelize, User, UserAddress };
