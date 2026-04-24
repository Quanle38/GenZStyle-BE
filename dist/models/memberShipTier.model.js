"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembershipTier = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = require("../config/connection"); // Giả định đường dẫn
class MembershipTier extends sequelize_1.Model {
}
exports.MembershipTier = MembershipTier;
// --- Khởi tạo Model ---
MembershipTier.init({
    id: {
        type: sequelize_1.DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    min_points: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    discount_rate: {
        type: sequelize_1.DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00,
    },
    is_deleted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    sequelize: connection_1.sequelize,
    tableName: "MembershipTiers",
    timestamps: false,
});
//# sourceMappingURL=memberShipTier.model.js.map