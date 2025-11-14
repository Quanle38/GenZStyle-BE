// coupon.model.ts
import { DataTypes, Model, Optional, Association } from "sequelize";
import { sequelize } from "../config/connection";
// Import các type cần thiết cho quan hệ
import type { ConditionSet } from "./conditionSets.model";

/**
 * Attributes for the Coupon Model (matches database columns)
 */
export interface CouponAttributes {
    id: string; // Primary Key
    code: string; // Mã code (Ví dụ: SALE20)
    start_time: Date; // Thời gian bắt đầu hiệu lực (Tổng thể)
    end_time: Date; // Thời gian kết thúc hiệu lực (Tổng thể)
    type: 'PERCENT' | 'FIXED'; // Loại giảm giá
    usage_limit: number; // Giới hạn tổng số lần sử dụng
    used_count: number; // Số lần đã sử dụng
    value: number; // Giá trị giảm giá (Ví dụ: 10.00 hoặc 50000.00)
    max_discount: number | null; // Giảm giá tối đa (Chỉ dùng cho PERCENT)
    
    // Khóa ngoại mới trỏ đến bộ điều kiện
    condition_set_id: string; 
    
    is_deleted: boolean;
    created_at: Date;
    updated_at: Date;

    // ➡️ Khai báo thuộc tính quan hệ cho TypeScript
    conditionSet?: ConditionSet;
}

/**
 * Attributes used for creating a new Coupon instance.
 */
export interface CouponCreationAttributes extends Optional<CouponAttributes, "used_count" | "is_deleted" | "created_at" | "updated_at" | "max_discount"> {}

/**
 * The Sequelize Coupon Model
 */
export class Coupon
    extends Model<CouponAttributes, CouponCreationAttributes>
    implements CouponAttributes {
    
    public id!: string;
    public code!: string;
    public start_time!: Date;
    public end_time!: Date;
    public type!: 'PERCENT' | 'FIXED';
    public usage_limit!: number;
    public used_count!: number;
    public value!: number;
    public max_discount!: number | null;
    
    public condition_set_id!: string;
    
    public is_deleted!: boolean;
    public created_at!: Date;
    public updated_at!: Date;

    // ➡️ Khai báo Public Field cho quan hệ BelongsTo
    public conditionSet?: ConditionSet;

    // ➡️ Khai báo Static Association
    public static associations: {
        conditionSet: Association<Coupon, ConditionSet>;
    };
}

// --- Khởi tạo Model ---
Coupon.init(
    {
        id: {
            type: DataTypes.STRING(255),
            primaryKey: true,
            allowNull: false,
        },
        code: {
            type: DataTypes.STRING(255),
            unique: true,
            allowNull: false,
        },
        start_time: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        end_time: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        type: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        usage_limit: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            allowNull: false,
        },
        used_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        value: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        max_discount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        // Định nghĩa Khóa ngoại
        condition_set_id: { 
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        is_deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
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
        tableName: "Coupons",
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);