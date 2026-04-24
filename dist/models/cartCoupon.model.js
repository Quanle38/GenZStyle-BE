"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartCoupon = void 0;
// cartCoupon.model.ts
const sequelize_1 = require("sequelize");
const connection_1 = require("../config/connection");
class CartCoupon extends sequelize_1.Model {
}
exports.CartCoupon = CartCoupon;
CartCoupon.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    cart_id: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        references: {
            model: "Carts",
            key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    },
    coupon_id: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        references: {
            model: "Coupons",
            key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    },
    applied_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: connection_1.sequelize,
    tableName: "CartCoupons",
    timestamps: false,
    // ✅ Tự tạo bảng nếu chưa tồn tại, ghi đè nếu muốn force
    // sync({ force: true }) sẽ được gọi ở nơi khởi động app
    indexes: [
        {
            // Mỗi cart chỉ dùng 1 coupon 1 lần
            unique: true,
            fields: ["cart_id", "coupon_id"],
        },
    ],
});
//# sourceMappingURL=cartCoupon.model.js.map