import { DataTypes, Model, Optional,
    // Import Mixins cho quan hệ belongsTo
    BelongsToGetAssociationMixin, BelongsToSetAssociationMixin,
    BelongsToCreateAssociationMixin, Association
} from "sequelize";
import { sequelize } from "../config/connection";
// Dùng 'type' import để tránh lỗi Circular Dependency
import type { User } from "./user.model";

/**
 * Attributes for the UserAddress Model (matches database columns)
 */
export interface UserAddressAttributes {
    address_id: number;
    user_id: string; // Khóa ngoại liên kết với User.id
    full_address: string;
    is_default: boolean;
    label: string;
    is_deleted: boolean;
    
    // ➡️ Bổ sung khai báo timestamps vì timestamps: true
    created_at: Date; 
    updated_at: Date; 

    user?: User;
}

/**
 * Thuộc tính tùy chọn khi tạo mới
 */
export interface UserAddressCreationAttributes extends Optional<UserAddressAttributes, "address_id" | "is_deleted" | "created_at" | "updated_at"> { } // Thêm created_at/updated_at vào Optional

/**
 * The Sequelize UserAddress Model
 */
export class UserAddress
    extends Model<UserAddressAttributes, UserAddressCreationAttributes>
    implements UserAddressAttributes {
    
    public address_id!: number;
    public user_id!: string;
    public full_address!: string;
    public is_default!: boolean;
    public label!: string;
    public is_deleted!: boolean;
    
    // ➡️ Bổ sung khai báo public fields cho timestamps
    public created_at!: Date; 
    public updated_at!: Date; 

    // Mixins cho quan hệ BelongsTo
    public getUser!: BelongsToGetAssociationMixin<User>;
    public setUser!: BelongsToSetAssociationMixin<User, string>; 
    public createUser!: BelongsToCreateAssociationMixin<User>;

    public static associations: {
        user: Association<UserAddress, User>;
    };
}

// --- Khởi tạo Model ---
UserAddress.init(
    {
        address_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        full_address: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        is_default: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        label: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        is_deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        // ➡️ Khai báo cột created_at (Cần thiết để Sequelize biết tên cột)
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        // ➡️ Khai báo cột updated_at (Cần thiết để Sequelize biết tên cột)
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "UserAddresses",
        timestamps: true,
        // 💡 Map tên cột cho Sequelize
        createdAt: 'created_at', 
        updatedAt: 'updated_at',
    }
);