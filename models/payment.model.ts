import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/connection";
import { TransactionStatus } from "../enums/transaction";

export class Payment extends Model {
    public id!: number;

    public order_id!: string;
    public gateway!: string | null;
    public amount!: number;
    public type!: "in" | "out";
    public reference_number!: string | null;

    public status!: string;
    public content!: string | null;     // ✅ THÊM FIELD MỚI
    public created_at!: Date;
}

Payment.init(
    {
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
            defaultValue: "in",
        },
        reference_number: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },

        status: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: TransactionStatus.Pending,
        },

        // ✅ THÊM TRƯỜNG content
        content: {
            type: DataTypes.STRING, // VARCHAR
            allowNull: true,
            defaultValue: null,
        },

        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: "Payments",
        timestamps: true,
        updatedAt: false,
        createdAt: "created_at",
        underscored: true,
    }
);