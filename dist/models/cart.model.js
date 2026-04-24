"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cart = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = require("../config/connection");
class Cart extends sequelize_1.Model {
}
exports.Cart = Cart;
Cart.init({
    id: {
        type: sequelize_1.DataTypes.STRING(255),
        primaryKey: true,
        allowNull: false,
        defaultValue: connection_1.sequelize.literal("next_cart_id()")
    },
    user_id: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    },
    amount: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    total_price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0
    }
}, {
    sequelize: connection_1.sequelize,
    tableName: "Carts",
    timestamps: false,
    underscored: true
});
//# sourceMappingURL=cart.model.js.map