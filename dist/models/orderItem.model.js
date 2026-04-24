"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderItem = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = require("../config/connection");
class OrderItem extends sequelize_1.Model {
}
exports.OrderItem = OrderItem;
OrderItem.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    order_id: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    },
    variant_id: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    price_per_unit: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
}, {
    sequelize: connection_1.sequelize,
    tableName: "OrderItems",
    timestamps: false,
    underscored: true
});
//# sourceMappingURL=orderItem.model.js.map