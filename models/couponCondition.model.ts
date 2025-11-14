// models/couponCondition.model.ts
import {
    DataTypes, Model, Optional,
    BelongsToGetAssociationMixin, BelongsToSetAssociationMixin,
    BelongsToCreateAssociationMixin, Association
} from "sequelize";
import { sequelize } from "../config/connection";
import type { Coupon } from "./coupon.model";

// Enum Type cho Condition Type
//export type ConditionType = 'MIN_ORDER_VALUE' | 'APPLY_TO_PRODUCT' | 'APPLY_TO_CATEGORY' | 'APPLY_TO_USER'; 

/**
 * Attributes for the CouponCondition Model
 */
export interface CouponConditionAttributes {
    condition_id: number; // Primary Key
    coupon_id: string; // Foreign Key to Coupon
    condition_type: string;
    condition_value: string; // Giá trị điều kiện (VD: Order value, product ID, category ID)
    is_deleted: boolean;
    created_at: Date; // Thêm timestamps để quản lý
    updated_at: Date; // Thêm timestamps để quản lý

    // Quan hệ
    coupon?: Coupon;
}

interface CouponConditionCreationAttributes extends Optional<CouponConditionAttributes,
    "condition_id" | "is_deleted" | "created_at" | "updated_at"> { }

export class CouponCondition
    extends Model<CouponConditionAttributes, CouponConditionCreationAttributes>
    implements CouponConditionAttributes {

    public condition_id!: number;
    public coupon_id!: string;
    public condition_type!: string;
    public condition_value!: string;
    public is_deleted!: boolean;
    public created_at!: Date;
    public updated_at!: Date;

    // Mixins cho quan hệ BelongsTo Coupon
    public getCoupon!: BelongsToGetAssociationMixin<Coupon>;
    public setCoupon!: BelongsToSetAssociationMixin<Coupon, string>; 
    public createCoupon!: BelongsToCreateAssociationMixin<Coupon>;

    public static associations: {
        coupon: Association<CouponCondition, Coupon>;
    };
}

// --- Khởi tạo Model ---
CouponCondition.init(
    {
        condition_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        coupon_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        condition_type: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        condition_value: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        is_deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
         created_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "CouponConditions",
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);