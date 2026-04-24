"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponCondition = void 0;
// models/couponCondition.model.ts
const sequelize_1 = require("sequelize");
const connection_1 = require("../config/connection");
class CouponCondition extends sequelize_1.Model {
}
exports.CouponCondition = CouponCondition;
// --- Khởi tạo Model ---
CouponCondition.init({
    condition_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    coupon_id: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    condition_type: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    condition_value: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    is_deleted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    tableName: "CouponConditions",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});
//# sourceMappingURL=couponCondition.model.js.map