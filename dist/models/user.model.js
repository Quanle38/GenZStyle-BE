"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = require("../config/connection");
class User extends sequelize_1.Model {
}
exports.User = User;
User.init({
    id: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        defaultValue: connection_1.sequelize.literal("next_user_id()")
    },
    refresh_token: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    first_name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    last_name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    dob: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    phone_number: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    gender: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    is_new: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    role: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    is_deleted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    avatar: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    updated_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    membership_id: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
}, {
    sequelize: connection_1.sequelize,
    tableName: "Users",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});
//# sourceMappingURL=user.model.js.map