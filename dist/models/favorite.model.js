"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Favorite = void 0;
// models/favorite.model.ts
const sequelize_1 = require("sequelize");
const connection_1 = require("../config/connection");
/**
 * The Sequelize Favorite Model
 */
class Favorite extends sequelize_1.Model {
}
exports.Favorite = Favorite;
// --- Khởi tạo Model ---
Favorite.init({
    favorite_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    user_id: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    product_id: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
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
    tableName: "Favorites",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});
//# sourceMappingURL=favorite.model.js.map