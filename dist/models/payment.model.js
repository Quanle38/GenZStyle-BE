"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = require("../config/connection");
const transaction_1 = require("../enums/transaction");
class Payment extends sequelize_1.Model {
}
exports.Payment = Payment;
Payment.init({
    id: {
        type: sequelize_1.DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    order_id: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    gateway: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(20, 2),
        allowNull: false,
    },
    type: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        defaultValue: "in",
    },
    reference_number: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        defaultValue: transaction_1.TransactionStatus.Pending,
    },
    // ✅ THÊM TRƯỜNG content
    content: {
        type: sequelize_1.DataTypes.STRING, // VARCHAR
        allowNull: true,
        defaultValue: null,
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: connection_1.sequelize,
    tableName: "Payments",
    timestamps: true,
    updatedAt: false,
    createdAt: "created_at",
    underscored: true,
});
//# sourceMappingURL=payment.model.js.map