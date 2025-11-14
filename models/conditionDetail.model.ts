// conditionDetail.model.ts
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/connection";
import type { ConditionSet } from "./conditionSets.model";

// Định nghĩa các loại Condition Type bạn đã thiết kế
export type CouponConditionType = 
    'TIER' | 
    'MIN_ORDER_VALUE' | 
    'NEW_USER' |
    'DAY_OF_WEEK' |     
    'HOUR_OF_DAY';     

export interface ConditionDetailAttributes {
    condition_detail_id: number; // PK
    condition_set_id: string; // FK
    condition_type: CouponConditionType; // Loại điều kiện
    condition_value: string; // Giá trị điều kiện (Ví dụ: 'GOLD', '500000')
    is_deleted: boolean;
    
    // Khai báo quan hệ
    conditionSet?: ConditionSet;
}

interface ConditionDetailCreationAttributes extends Optional<ConditionDetailAttributes, "condition_detail_id" | "is_deleted"> {}

export class ConditionDetail
    extends Model<ConditionDetailAttributes, ConditionDetailCreationAttributes>
    implements ConditionDetailAttributes {
    
    public condition_detail_id!: number;
    public condition_set_id!: string;
    public condition_type!: CouponConditionType;
    public condition_value!: string;
    public is_deleted!: boolean;
}

ConditionDetail.init(
    {
        condition_detail_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        condition_set_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        condition_type: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        condition_value: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        is_deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "ConditionDetails",
        timestamps: false, // Bảng này không cần timestamps
    }
);