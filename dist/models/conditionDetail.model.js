"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConditionDetail = void 0;
// conditionDetail.model.ts
const sequelize_1 = require("sequelize");
const connection_1 = require("../config/connection");
class ConditionDetail extends sequelize_1.Model {
}
exports.ConditionDetail = ConditionDetail;
ConditionDetail.init({
    condition_detail_id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    condition_set_id: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    condition_type: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    condition_value: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    is_deleted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
}, {
    sequelize: connection_1.sequelize,
    tableName: "ConditionDetails",
    timestamps: false, // Bảng này không cần timestamps
});
//# sourceMappingURL=conditionDetail.model.js.map