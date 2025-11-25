import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/connection";

export class OrderItem extends Model {
    public id!: number;
    public order_id!: string;
    public variant_id!: string;
    public quantity!: number;
    public price_per_unit!: number;
}

OrderItem.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    order_id: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    variant_id: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    price_per_unit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
}, {
    sequelize,
    tableName: "OrderItems",
    timestamps: false,
    underscored: true
});