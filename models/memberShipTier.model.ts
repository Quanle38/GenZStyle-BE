import { DataTypes, Model, Optional, Association } from "sequelize";
import { sequelize } from "../config/connection"; // Giả định đường dẫn
import type { User } from "./user.model"; // Cần import model User

/**
 * Attributes for the MembershipTier Model
 */
export interface MembershipTierAttributes {
    id: string; // Primary Key: Tên viết tắt của Rank (e.g., GOLD, SILVER)
    name: string; // Tên hiển thị (e.g., Hạng Vàng)
    min_points: number; // Ngưỡng điểm tối thiểu để đạt hạng
    discount_rate: number; // Lợi ích cơ bản (e.g., 5% giảm giá)
    is_deleted: boolean;
    
    // Khai báo quan hệ để include Users
    users?: User[];
}

export interface MembershipTierCreationAttributes extends Optional<MembershipTierAttributes,
    "min_points" | "discount_rate" | "is_deleted"> { }

export class MembershipTier
    extends Model<MembershipTierAttributes, MembershipTierCreationAttributes>
    implements MembershipTierAttributes {

    public id!: string;
    public name!: string;
    public min_points!: number;
    public discount_rate!: number;
    public is_deleted!: boolean;
    public users?: User[];

    public static associations: {
        users: Association<MembershipTier, User>;
    };
}

// --- Khởi tạo Model ---
MembershipTier.init(
    {
        id: {
            type: DataTypes.STRING(50),
            primaryKey: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        min_points: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        discount_rate: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0.00,
        },
        is_deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        sequelize,
        tableName: "MembershipTiers",
        timestamps: false,
    }
);