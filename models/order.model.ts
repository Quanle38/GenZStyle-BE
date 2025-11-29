import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/connection";
import { OrderStatus, OrderMethod } from "../enums/order"; // Import OrderMethod

export interface OrderAttributes {
    id: string;
    user_id: string;
    cart_id: string | null;
    quantity: number;
    total_price: number;
    status: string;
    method: string; // ✨ Đã thêm trường method
    created_at: Date;
    updated_at: Date;
}

interface OrderCreationAttributes extends Optional<OrderAttributes,
    "id" | "created_at" | "updated_at" | "status" | "cart_id" | "method"> { } // ✨ Thêm 'method' vào Optional

export class Order
    extends Model<OrderAttributes, OrderCreationAttributes>
    implements OrderAttributes {

    public id!: string;
    public user_id!: string;
    public cart_id!: string | null;
    public quantity!: number;
    public total_price!: number;
    public status!: string;
    public method!: string; // ✨ Khai báo thuộc tính method
    public created_at!: Date;
    public updated_at!: Date;
}

Order.init({
    id: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        allowNull: false,
        defaultValue: sequelize.literal("next_order_id()")
    },
    user_id: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    cart_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    total_price: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 0.00
    },
    status: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: OrderStatus.PENDING
    },
    // ✨ Định nghĩa trường method mới
    method: {
        type: DataTypes.STRING(50), // Hoặc dùng DataTypes.ENUM
        allowNull: false,
        defaultValue: OrderMethod.CAST // Mặc định là thanh toán tiền mặt/COD
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    sequelize,
    tableName: "Orders",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
});