// models/coupon.model.ts
import {
    DataTypes, Model, Optional,
    HasManyGetAssociationsMixin, HasManyAddAssociationMixin,
    HasManySetAssociationsMixin, HasManyRemoveAssociationMixin,
    HasManyCountAssociationsMixin, HasManyCreateAssociationMixin,
    Association
} from "sequelize";
import { sequelize } from "../config/connection";
import type { CouponCondition } from "./couponCondition.model";


/**
 * Attributes for the Coupon Model
 */
export interface CouponAttributes {
    id: string; // Primary Key
    code: string;
    start_time: Date;
    end_time: Date;
    type: string;
    usage_limit: number;
    used_count: number;
    value: number; // Giá trị chiết khấu (VD: 10 cho 10% hoặc 10000 cho 10k VND)
    max_discount: number | null; // Mức chiết khấu tối đa (chỉ áp dụng cho PERCENT)
    is_deleted: boolean;
    created_at: Date;
    updated_at: Date;

    // Quan hệ
    conditions?: CouponCondition[];
}

export interface CouponCreationAttributes extends Optional<CouponAttributes,
    "used_count" | "is_deleted" | "max_discount" | "created_at" | "updated_at"> { }

export class Coupon
    extends Model<CouponAttributes, CouponCreationAttributes>
    implements CouponAttributes {

    public id!: string;
    public code!: string;
    public start_time!: Date;
    public end_time!: Date;
    public type!: string;
    public usage_limit!: number;
    public used_count!: number;
    public value!: number;
    public max_discount!: number | null;
    public is_deleted!: boolean;
    public created_at!: Date;
    public updated_at!: Date;
    public conditions?: CouponCondition[];
    // Mixins cho CouponConditions
    public getConditions!: HasManyGetAssociationsMixin<CouponCondition>;
    public addCondition!: HasManyAddAssociationMixin<CouponCondition, number>;
    // ... các mixin khác tương tự như Product

    public static associations: {
        conditions: Association<Coupon, CouponCondition>;
    };
}

// --- Khởi tạo Model ---
Coupon.init(
    {
        id: {
            type: DataTypes.STRING(255),
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        code: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        start_time: {
            type: DataTypes.DATE, // timestamp without time zone -> DATE
            allowNull: false,
        },
        end_time: {
            type: DataTypes.DATE, // timestamp without time zone -> DATE
            allowNull: false,
        },
        type: {
            type: DataTypes.TEXT, // Giả định
            allowNull: false,
            defaultValue: 'PERCENT',
        },
        usage_limit: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        used_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        value: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        max_discount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        is_deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "Coupons",
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);