import {
    DataTypes,
    Model,
    BelongsToGetAssociationMixin
} from "sequelize";
import { sequelize } from "../config/connection";
import type { ProductVariant } from "./productVariant.model";
import type { Cart } from "./cart.model";

export class CartItem extends Model {
    public id!: number;
    public cart_id!: string;
    public variant_id!: string;
    public total_price!: number;
    public quantity!: number;

    // =====================
    // ✅ ASSOCIATION FIELDS (QUAN TRỌNG)
    // =====================
    public variant?: ProductVariant;
    public cart?: Cart;

    // =====================
    // ✅ MIXINS (OPTIONAL NHƯNG NÊN CÓ)
    // =====================
    public getVariant!: BelongsToGetAssociationMixin<ProductVariant>;
    public getCart!: BelongsToGetAssociationMixin<Cart>;
}

CartItem.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        cart_id: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        variant_id: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        total_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        sequelize,
        tableName: "CartItems",
        timestamps: false,
        underscored: true
    }
);
