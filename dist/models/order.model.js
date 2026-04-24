"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = require("../config/connection");
const order_1 = require("../enums/order"); // Import OrderMethod
class Order extends sequelize_1.Model {
}
exports.Order = Order;
Order.init({
    id: {
        type: sequelize_1.DataTypes.STRING(255),
        primaryKey: true,
        allowNull: false,
        defaultValue: connection_1.sequelize.literal("next_order_id()")
    },
    user_id: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    },
    cart_id: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    total_price: {
        type: sequelize_1.DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 0.00
    },
    status: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
        defaultValue: order_1.OrderStatus.PENDING
    },
    // ✨ Định nghĩa trường method mới
    method: {
        type: sequelize_1.DataTypes.STRING(50), // Hoặc dùng DataTypes.ENUM
        allowNull: false,
        defaultValue: order_1.OrderMethod.CAST // Mặc định là thanh toán tiền mặt/COD
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    updated_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
}, {
    sequelize: connection_1.sequelize,
    tableName: "Orders",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
});
//# sourceMappingURL=order.model.js.map