"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductVariant = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = require("../config/connection");
class ProductVariant extends sequelize_1.Model {
}
exports.ProductVariant = ProductVariant;
ProductVariant.init({
    id: {
        type: sequelize_1.DataTypes.STRING(255),
        primaryKey: true,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    product_id: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        references: {
            model: 'Products',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    size: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    color: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    stock: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    is_deleted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
    },
    image: {
        type: sequelize_1.DataTypes.TEXT,
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
}, {
    sequelize: connection_1.sequelize,
    tableName: "Variants",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});
//# sourceMappingURL=productVariant.model.js.map