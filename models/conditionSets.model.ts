import { 
    DataTypes, 
    Model, 
    Optional, 
    Association, 
    HasManyGetAssociationsMixin, // Mixin cần thiết
    HasManyAddAssociationMixin,
    HasManyHasAssociationMixin,
    HasManyCountAssociationsMixin,
    HasManyCreateAssociationMixin,
    HasManySetAssociationsMixin
} from "sequelize";
import { sequelize } from "../config/connection";
import type { Coupon } from "./coupon.model";
import type { ConditionDetail } from "./conditionDetail.model";

export interface ConditionSetAttributes {
    id: string; // PK: Ví dụ: SET001
    name: string; // Tên hiển thị (Ví dụ: "Điều kiện VIP Gold")
    is_reusable: boolean; // Có thể tái sử dụng cho nhiều Coupon không
    created_at: Date;
    updated_at: Date;

    // Khai báo quan hệ
    coupons?: Coupon[];
    details?: ConditionDetail[];
}

interface ConditionSetCreationAttributes extends Optional<ConditionSetAttributes, "created_at" | "updated_at" | "is_reusable"> {}

// Thêm các Mixins cho quan hệ HasMany (để Typescript nhận ra các hàm getDetails, setDetails, v.v.)
export class ConditionSet
    extends Model<ConditionSetAttributes, ConditionSetCreationAttributes>
    implements ConditionSetAttributes {
    
    public id!: string;
    public name!: string;
    public is_reusable!: boolean;
    public created_at!: Date;
    public updated_at!: Date;
    
    // Khai báo thuộc tính quan hệ (đã có)
    public details?: ConditionDetail[] | [];
    public coupons?: Coupon[] | [];

    // ➡️ KHAI BÁO MIXINS CHO DETAILS (QUAN TRỌNG VỚI TYPESCRIPT)
    public getDetails!: HasManyGetAssociationsMixin<ConditionDetail>;
    public setDetails!: HasManySetAssociationsMixin<ConditionDetail, string>;
    public addDetail!: HasManyAddAssociationMixin<ConditionDetail, string>;
    public createDetail!: HasManyCreateAssociationMixin<ConditionDetail>;
    public countDetails!: HasManyCountAssociationsMixin;
    public hasDetail!: HasManyHasAssociationMixin<ConditionDetail, string>;

    // ➡️ KHAI BÁO MIXINS CHO COUPONS
    public getCoupons!: HasManyGetAssociationsMixin<Coupon>;
    public setCoupons!: HasManySetAssociationsMixin<Coupon, string>;
    // ... (Thêm các Mixin khác nếu cần)
    
    // Khai báo tĩnh (đã có)
    public static associations: {
        coupons: Association<ConditionSet, Coupon>;
        details: Association<ConditionSet, ConditionDetail>;
    };
}

ConditionSet.init(
    {
        id: {
            type: DataTypes.UUID, // Thường dùng UUID thay vì STRING cho ID
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        is_reusable: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
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
        tableName: "ConditionSets",
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        // SỬ DỤNG UUID thay vì STRING(255) cho ID
    }
);