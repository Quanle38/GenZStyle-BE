"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAddress = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = require("../config/connection");
/**
 * The Sequelize UserAddress Model
 */
class UserAddress extends sequelize_1.Model {
}
exports.UserAddress = UserAddress;
// --- Khởi tạo Model ---
UserAddress.init({
    address_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    full_address: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    is_default: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    label: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    is_deleted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    // ➡️ Khai báo cột created_at (Cần thiết để Sequelize biết tên cột)
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    // ➡️ Khai báo cột updated_at (Cần thiết để Sequelize biết tên cột)
    updated_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
}, {
    sequelize: connection_1.sequelize,
    tableName: "UserAddresses",
    timestamps: true,
    // 💡 Map tên cột cho Sequelize
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});
//# sourceMappingURL=userAddress.model.js.map