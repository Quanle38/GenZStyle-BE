"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Coupon = void 0;
// coupon.model.ts
const sequelize_1 = require("sequelize");
const connection_1 = require("../config/connection");
/**
 * The Sequelize Coupon Model
 */
class Coupon extends sequelize_1.Model {
}
exports.Coupon = Coupon;
// --- Khởi tạo Model ---
Coupon.init({
    id: {
        type: sequelize_1.DataTypes.STRING(255),
        primaryKey: true,
        allowNull: false,
    },
    code: {
        type: sequelize_1.DataTypes.STRING(255),
        unique: true,
        allowNull: false,
    },
    start_time: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    end_time: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    type: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    usage_limit: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false,
    },
    used_count: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    value: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    max_discount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    // Định nghĩa Khóa ngoại
    condition_set_id: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    is_deleted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
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
    tableName: "Coupons",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});
//# sourceMappingURL=coupon.model.js.map