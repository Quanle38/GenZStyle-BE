import {
    DataTypes, Model, Optional,
    // Import các Mixins cần thiết cho quan hệ hasMany
    HasManyGetAssociationsMixin, HasManyAddAssociationMixin,
    HasManySetAssociationsMixin, HasManyRemoveAssociationMixin,
    HasManyCountAssociationsMixin, HasManyCreateAssociationMixin,
    Association
} from "sequelize";
import { sequelize } from "../config/connection";
import type { MembershipTier } from "./memberShipTier.model";
// Dùng 'type' import để tránh lỗi Circular Dependency nếu userAddress.model.ts cũng import user.model.ts
import type { UserAddress } from "./userAddress.model";

/**
 * Attributes for the User Model (matches database columns)
 */
export interface UserAttributes {
    id: string;
    refresh_token: string | null;
    first_name: string;
    last_name: string;
    email: string;
    dob: Date;
    phone_number: string;
    gender: string;
    password: string;
    created_at: Date;
    updated_at: Date;
    is_new: boolean;
    role: string;
    is_deleted: boolean;
    avatar: string | null;
    membership_id: string; // ⬅️ ĐÃ ĐỔI TÊN
    // ➡️ Khai báo thuộc tính quan hệ cho TypeScript
    addresses?: UserAddress[];
    membership?: MembershipTier;
}

/**
 * Attributes used for creating a new User instance.
 */
interface UserCreationAttributes extends Optional<UserAttributes, "id" | "created_at" | "updated_at" | "refresh_token" | "avatar" | "is_new" | "is_deleted"> { }

/**
 * The Sequelize User Model
 */
export class User
    extends Model<UserAttributes, UserCreationAttributes>
    implements UserAttributes {
    // Public fields (Sequelize properties)
    public id!: string;
    public refresh_token!: string | null;
    public first_name!: string;
    public last_name!: string;
    public email!: string;
    public dob!: Date;
    public phone_number!: string;
    public gender!: string;
    public password!: string;
    public created_at!: Date;
    public updated_at!: Date;
    public is_new!: boolean;
    public role!: string;
    public is_deleted!: boolean;
    public avatar!: string | null;
    public membership_id!: string; // ⬅️ ĐÃ ĐỔI TÊN
    public membership?: MembershipTier;

    // ➡️ Khai báo Mixins cho quan hệ HasMany (user.getAddresses(), user.createAddress(), ...)
   public getAddresses!: HasManyGetAssociationsMixin<UserAddress>;
    public addAddress!: HasManyAddAssociationMixin<UserAddress, number>;
    public addAddresses!: HasManyAddAssociationMixin<UserAddress, number>;
    public setAddresses!: HasManySetAssociationsMixin<UserAddress, number>;
    public removeAddress!: HasManyRemoveAssociationMixin<UserAddress, number>;
    public removeAddresses!: HasManyRemoveAssociationMixin<UserAddress, number>;
    public countAddresses!: HasManyCountAssociationsMixin;
    public createAddress!: HasManyCreateAssociationMixin<UserAddress>;
    

    // ➡️ Khai báo Static Association (cần thiết cho một số phiên bản Sequelize hoặc tiện ích)
    public static associations: {
        addresses: Association<User, UserAddress>;
        membership: Association<User, MembershipTier>;
    };
}

// --- Khởi tạo Model ---
User.init(
    {
        // Primary Key (assuming id is a UUID or custom string format "Uxxx")
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
            // Thêm dòng này để Sequelize không validate khi create
            defaultValue: DataTypes.UUIDV4, // Giá trị giả, DB trigger sẽ override
        },
        refresh_token: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        dob: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        phone_number: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        gender: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        is_new: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        is_deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        avatar: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        membership_id: { // ⬅️ ĐÃ ĐỔI TÊN VÀ KHỞI TẠO CỘT
            type: DataTypes.STRING(50), 
            allowNull: false, 
            defaultValue: 'BRONZE' // Mặc định là hạng cơ bản
        },

    },
    
    {
        sequelize,
        tableName: "Users",
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);