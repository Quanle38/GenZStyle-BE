import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/connection"; // Giả định đây là đối tượng kết nối sequelize của bạn
import { TransactionStatus } from "../enums/transaction";

// 1. Định nghĩa lớp mô hình và các thuộc tính (TypeScript interface)
export class Payment extends Model {
    public id!: number;

    public order_id!: string;
    public gateway!: string | null;
    public amount!: number;
    public type!: 'in' | 'out';
    public reference_number!: string | null;
    public status!: string; // 👈 Đã thêm trường status
    public created_at!: Date;
}

// 2. Khởi tạo schema mô hình
Payment.init({
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    order_id: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    gateway: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    amount: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
    },
    type: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue : "in"
        // Có thể thêm: validate: { isIn: [['in', 'out']] }
    },
    reference_number: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    // 👇 Đã thêm định nghĩa cho trường status
    status: {
        type: DataTypes.STRING(50), // VARCHAR(50)
        allowNull: false, // Thường trường status cần NOT NULL và có giá trị mặc định
        defaultValue: TransactionStatus.Pending // Thêm giá trị mặc định phổ biến
    },
    // 👆 Kết thúc định nghĩa cho trường status
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    sequelize,
    tableName: "Payments",
    timestamps: true,
    updatedAt: false,
    createdAt: 'created_at',
    underscored: true
});