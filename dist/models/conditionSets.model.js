"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConditionSet = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = require("../config/connection");
// Thêm các Mixins cho quan hệ HasMany (để Typescript nhận ra các hàm getDetails, setDetails, v.v.)
class ConditionSet extends sequelize_1.Model {
}
exports.ConditionSet = ConditionSet;
ConditionSet.init({
    id: {
        type: sequelize_1.DataTypes.UUID, // Thường dùng UUID thay vì STRING cho ID
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    is_reusable: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
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
    tableName: "ConditionSets",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    // SỬ DỤNG UUID thay vì STRING(255) cho ID
});
//# sourceMappingURL=conditionSets.model.js.map