"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = require("../config/connection");
class Product extends sequelize_1.Model {
}
exports.Product = Product;
Product.init({
    id: {
        type: sequelize_1.DataTypes.STRING(255),
        primaryKey: true,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    base_price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    is_deleted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
    },
    brand: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW, // Thêm mặc định
    },
    updated_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW, // Thêm mặc định
    },
    category: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    }
}, {
    sequelize: connection_1.sequelize,
    tableName: "Products",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});
//# sourceMappingURL=product.model.js.map