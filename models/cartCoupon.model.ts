// cartCoupon.model.ts
import { DataTypes, Model, Optional, Association } from "sequelize";
import { sequelize } from "../config/connection";
import type { Cart } from "./cart.model";
import type { Coupon } from "./coupon.model";

/**
 * Attributes for the CartCoupon Model (junction table: Carts <-> Coupons)
 */
export interface CartCouponAttributes {
    id: number;
    cart_id: string;
    coupon_id: string;
    applied_at: Date;

    // Relation fields
    cart?: Cart;
    coupon?: Coupon;
}

export interface CartCouponCreationAttributes
    extends Optional<CartCouponAttributes, "id" | "applied_at"> {}

export class CartCoupon
    extends Model<CartCouponAttributes, CartCouponCreationAttributes>
    implements CartCouponAttributes
{
    public id!: number;
    public cart_id!: string;
    public coupon_id!: string;
    public applied_at!: Date;

    public cart?: Cart;
    public coupon?: Coupon;

    public static associations: {
        cart: Association<CartCoupon, Cart>;
        coupon: Association<CartCoupon, Coupon>;
    };
}

CartCoupon.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        cart_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            references: {
                model: "Carts",
                key: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        coupon_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            references: {
                model: "Coupons",
                key: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        applied_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: "CartCoupons",
        timestamps: false,
        // ✅ Tự tạo bảng nếu chưa tồn tại, ghi đè nếu muốn force
        // sync({ force: true }) sẽ được gọi ở nơi khởi động app
        indexes: [
            {
                // Mỗi cart chỉ dùng 1 coupon 1 lần
                unique: true,
                fields: ["cart_id", "coupon_id"],
            },
        ],
    }
);