"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartItem = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = require("../config/connection");
class CartItem extends sequelize_1.Model {
}
exports.CartItem = CartItem;
CartItem.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    cart_id: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    },
    variant_id: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    },
    total_price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize: connection_1.sequelize,
    tableName: "CartItems",
    timestamps: false,
    underscored: true
});
//# sourceMappingURL=cartItem.model.js.map